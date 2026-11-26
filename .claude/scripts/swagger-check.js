#!/usr/bin/env node
// Reads the backend Swagger spec and tracks API changes against a committed snapshot.
//
// Usage (from any directory):
//   node .claude/scripts/swagger-check.js                # diff live spec vs snapshot, and check apiConfig.js
//   node .claude/scripts/swagger-check.js --show <text>  # print endpoints whose path or controller contains <text>, with schemas
//   node .claude/scripts/swagger-check.js --controllers  # list controllers (Swagger tags) with their endpoint counts
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
                // Some formData params carry their type in `schema` instead of on the param itself.
                const type = param.in === 'body' || !param.type ? typeOf(param.schema || param) : typeOf(param);
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

// Controller (Swagger tag) and param descriptions per endpoint. Kept out of normalize() so the snapshot
// format, and therefore the change report, stays the same.
const readDetails = (spec) => {
    const details = {};
    Object.entries(spec.paths || {}).forEach(([url, operations]) => {
        HTTP_METHODS.filter((method) => operations[method]).forEach((method) => {
            const operation = operations[method];
            const descriptions = {};
            (operation.parameters || []).forEach((param) => {
                if (param.description) descriptions[`${param.in}:${param.name}`] = param.description;
            });
            details[`${method.toUpperCase()} ${url}`] = {
                controller: (operation.tags || []).join(', ') || '(untagged)',
                summary: operation.summary,
                consumes: (operation.consumes || []).join(', '),
                descriptions,
            };
        });
    });
    return details;
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
    // `path` is what multipart uploads use instead of `baseURL`.
    const pattern = /(?:baseURL|path):\s*`\$\{apiUrl\}([^`]+)`,\s*method:\s*['"`](\w+)['"`]/g;
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

const showEndpoints = (live, details, text) => {
    const needle = text.toLowerCase();
    const keys = Object.keys(live.endpoints).filter(
        (key) => key.toLowerCase().includes(needle) || details[key]?.controller.toLowerCase().includes(needle),
    );
    if (keys.length === 0) {
        console.log(`No endpoint path or controller contains "${text}". Try --controllers.`);
        return;
    }
    keys.forEach((key) => {
        const { params, response } = live.endpoints[key];
        const { controller, summary, consumes, descriptions = {} } = details[key] || {};
        console.log(`${key}    [${controller}]${summary ? ` ${summary}` : ''}`);
        if (consumes && consumes !== 'application/json') console.log(`  consumes: ${consumes}`);
        Object.entries(params).forEach(([name, type]) => {
            console.log(`  ${name}: ${type}${descriptions[name] ? `  -- ${descriptions[name]}` : ''}`);
            if (name.startsWith('body:')) printSchema(live, type.replace(' (required)', ''), '    ', new Set());
        });
        // Resource is Spring's binary stream wrapper; its Java internals say nothing about the contract.
        console.log(`  response: ${response}${response === 'Resource' ? ' (file stream)' : ''}`);
        if (response !== 'Resource') printSchema(live, response, '    ', new Set());
    });
};

const showControllers = (details) => {
    const counts = {};
    Object.values(details).forEach(({ controller }) => {
        counts[controller] = (counts[controller] || 0) + 1;
    });
    Object.keys(counts)
        .sort()
        .forEach((controller) => console.log(`  ${controller} (${counts[controller]})`));
};

const main = async () => {
    const args = process.argv.slice(2);
    const spec = await fetchSpec();
    const live = normalize(spec);

    if (args[0] === '--show') {
        showEndpoints(live, readDetails(spec), args[1] || '');
        return;
    }

    if (args[0] === '--controllers') {
        showControllers(readDetails(spec));
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
