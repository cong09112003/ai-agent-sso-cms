#!/usr/bin/env node
// Reads the backend Swagger spec and tracks API changes against a committed snapshot.
//
// Usage (from any directory):
//   node .claude/scripts/swagger-check.js                # diff live spec vs snapshot, and check apiConfig.js
//   node .claude/scripts/swagger-check.js --show <text>  # print endpoints whose path contains <text>, with schemas
//   node .claude/scripts/swagger-check.js --update       # overwrite the snapshot with the live spec
//
// SWAGGER_URL overrides the spec location. Exits 1 only when the spec can't be loaded.
const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const SPEC_URL = process.env.SWAGGER_URL || 'https://aiagent-sso-api.allaindev.site/v2/api-docs';
const REQUEST_TIMEOUT_MS = 30000;
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

const rootDir = path.resolve(__dirname, '..', '..');
const snapshotPath = path.join(rootDir, '.claude', 'swagger', 'api-docs.snapshot.json');
const apiConfigPath = path.join(rootDir, 'source', 'src', 'constants', 'apiConfig.js');

const fetchSpec = () =>
    new Promise((resolve, reject) => {
        const client = SPEC_URL.startsWith('https:') ? https : http;
        const request = client.get(SPEC_URL, { timeout: REQUEST_TIMEOUT_MS }, (response) => {
            if (response.statusCode !== 200) {
                response.resume();
                reject(new Error(`HTTP ${response.statusCode} from ${SPEC_URL}`));
                return;
            }
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                try {
                    resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
                } catch (error) {
                    reject(new Error(`Invalid JSON from ${SPEC_URL}: ${error.message}`));
                }
            });
        });
        request.on('timeout', () => request.destroy(new Error(`Timed out fetching ${SPEC_URL}`)));
        request.on('error', reject);
    });

const typeOf = (schema = {}) => {
    if (schema.$ref) return schema.$ref.replace('#/definitions/', '');
    if (schema.type === 'array') return `${typeOf(schema.items)}[]`;
    return schema.format ? `${schema.type}:${schema.format}` : schema.type || 'object';
};

const sortKeys = (object) =>
    Object.keys(object)
        .sort()
        .reduce((sorted, key) => ({ ...sorted, [key]: object[key] }), {});

// Keeps only the contract, so generated noise such as operationId doesn't show up as a change.
const normalize = (spec) => {
    const endpoints = {};
    Object.entries(spec.paths || {}).forEach(([url, operations]) => {
        HTTP_METHODS.filter((method) => operations[method]).forEach((method) => {
            const operation = operations[method];
            const params = {};
            (operation.parameters || []).forEach((param) => {
                const type = param.in === 'body' ? typeOf(param.schema) : typeOf(param);
                params[`${param.in}:${param.name}`] = `${type}${param.required ? ' (required)' : ''}`;
            });
            endpoints[`${method.toUpperCase()} ${url}`] = {
                params: sortKeys(params),
                response: typeOf(operation.responses?.['200']?.schema),
            };
        });
    });

    const definitions = {};
    Object.entries(spec.definitions || {}).forEach(([name, definition]) => {
        const required = definition.required || [];
        const fields = {};
        Object.entries(definition.properties || {}).forEach(([field, schema]) => {
            fields[field] = `${typeOf(schema)}${required.includes(field) ? ' (required)' : ''}`;
        });
        definitions[name] = sortKeys(fields);
    });

    return { endpoints: sortKeys(endpoints), definitions: sortKeys(definitions) };
};

const diffSection = (before, after) => {
    const added = Object.keys(after).filter((key) => !(key in before));
    const removed = Object.keys(before).filter((key) => !(key in after));
    const changed = Object.keys(after).filter(
        (key) => key in before && JSON.stringify(before[key]) !== JSON.stringify(after[key]),
    );
    return { added, removed, changed };
};

const diffFlat = (before = {}, after = {}) => {
    const lines = [];
    [...new Set([...Object.keys(before), ...Object.keys(after)])].forEach((key) => {
        if (before[key] === after[key]) return;
        lines.push(`      ${key}: ${before[key] ?? '(none)'} -> ${after[key] ?? '(none)'}`);
    });
    return lines;
};

// Reads `${apiUrl}...` entries from apiConfig.js as text, because that file uses ES imports and env values.
const readApiConfigEndpoints = () => {
    const source = fs.readFileSync(apiConfigPath, 'utf8');
    const pattern = /baseURL:\s*`\$\{apiUrl\}([^`]+)`,\s*method:\s*['"`](\w+)['"`]/g;
    const endpoints = new Set();
    let match = pattern.exec(source);
    while (match) {
        const url = match[1].split('?')[0].replace(/:(\w+)/g, '{$1}');
        endpoints.add(`${match[2].toUpperCase()} /${url}`);
        match = pattern.exec(source);
    }
    return endpoints;
};

const printDiff = (snapshot, live, usedEndpoints) => {
    const endpoints = diffSection(snapshot.endpoints, live.endpoints);
    const definitions = diffSection(snapshot.definitions, live.definitions);
    const count = [...Object.values(endpoints), ...Object.values(definitions)].flat().length;
    if (count === 0) {
        console.log('No API changes since the snapshot.');
        return;
    }

    const tag = (key) => (usedEndpoints.has(key) ? ' [used in apiConfig]' : '');
    console.log(`${count} API change(s) since the snapshot:`);
    endpoints.added.forEach((key) => console.log(`  + ${key}`));
    endpoints.removed.forEach((key) => console.log(`  - ${key}${tag(key)}`));
    endpoints.changed.forEach((key) => {
        console.log(`  ~ ${key}${tag(key)}`);
        diffFlat(snapshot.endpoints[key].params, live.endpoints[key].params).forEach((line) => console.log(line));
        if (snapshot.endpoints[key].response !== live.endpoints[key].response) {
            console.log(`      response: ${snapshot.endpoints[key].response} -> ${live.endpoints[key].response}`);
        }
    });
    definitions.added.forEach((key) => console.log(`  + schema ${key}`));
    definitions.removed.forEach((key) => console.log(`  - schema ${key}`));
    definitions.changed.forEach((key) => {
        console.log(`  ~ schema ${key}`);
        diffFlat(snapshot.definitions[key], live.definitions[key]).forEach((line) => console.log(line));
    });
};

const printSchema = (live, name, indent, seen) => {
    const baseName = name.replace(/\[\]$/, '');
    const fields = live.definitions[baseName];
    if (!fields || seen.has(baseName)) return;
    seen.add(baseName);
    console.log(`${indent}${baseName}:`);
    Object.entries(fields).forEach(([field, type]) => {
        console.log(`${indent}  ${field}: ${type}`);
        printSchema(live, type.replace(' (required)', ''), `${indent}    `, seen);
    });
};

const showEndpoints = (live, text) => {
    const keys = Object.keys(live.endpoints).filter((key) => key.toLowerCase().includes(text.toLowerCase()));
    if (keys.length === 0) {
        console.log(`No endpoint path contains "${text}".`);
        return;
    }
    keys.forEach((key) => {
        const { params, response } = live.endpoints[key];
        console.log(key);
        Object.entries(params).forEach(([name, type]) => {
            console.log(`  ${name}: ${type}`);
            if (name.startsWith('body:')) printSchema(live, type.replace(' (required)', ''), '    ', new Set());
        });
        console.log(`  response: ${response}`);
    });
};

const main = async () => {
    const args = process.argv.slice(2);
    const live = normalize(await fetchSpec());

    if (args[0] === '--show') {
        showEndpoints(live, args[1] || '');
        return;
    }

    if (args[0] === '--update') {
        fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
        fs.writeFileSync(snapshotPath, `${JSON.stringify(live, null, 2)}\n`);
        console.log(`Snapshot updated: ${Object.keys(live.endpoints).length} endpoints.`);
        return;
    }

    const usedEndpoints = readApiConfigEndpoints();
    if (fs.existsSync(snapshotPath)) {
        printDiff(JSON.parse(fs.readFileSync(snapshotPath, 'utf8')), live, usedEndpoints);
    } else {
        console.log('No snapshot yet. Run with --update to create one.');
    }

    // Path param names differ between the two sides (`:id` vs `{appId}`), so only their position counts.
    const withoutParamNames = (key) => key.replace(/\{\w+\}/g, '{}');
    const liveKeys = new Set(Object.keys(live.endpoints).map(withoutParamNames));
    const missing = [...usedEndpoints].filter((key) => !liveKeys.has(withoutParamNames(key))).sort();
    console.log(`\n${missing.length} endpoint(s) in apiConfig.js not found in the live spec:`);
    missing.forEach((key) => console.log(`  ${key}`));
};

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
