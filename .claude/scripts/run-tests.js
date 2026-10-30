#!/usr/bin/env node
// Runs Jest once (non-watch) through react-scripts with the `@<dir>` aliases mapped.
// `npm test` alone cannot resolve `@modules`, `@hooks`, ... because the aliases only exist in
// craco's webpack config, not in CRA's Jest config. This wrapper adds them on the command line,
// so package.json does not need to change.
//
// Usage (from any directory):
//   node .claude/scripts/run-tests.js                      # all tests
//   node .claude/scripts/run-tests.js src/utils             # tests under a path
//   node .claude/scripts/run-tests.js -t "orderNumber"      # by test name
//   node .claude/scripts/run-tests.js --coverage
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '..', '..', 'source');
const srcDir = path.join(sourceDir, 'src');
const reactScripts = path.join(sourceDir, 'node_modules', 'react-scripts', 'bin', 'react-scripts.js');

if (!fs.existsSync(reactScripts)) {
    console.error('react-scripts not found. Run `npm ci` in source/ first.');
    process.exit(1);
}

// Same rule as craco.config.js: every top-level folder in src/ gets an `@<name>` alias.
const aliasDirs = fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

// Passing moduleNameMapper on the CLI replaces CRA's default, so the CSS-module mapping is re-added.
const moduleNameMapper = {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    [`^@(${aliasDirs.join('|')})(.*)$`]: '<rootDir>/src/$1$2',
};

const result = spawnSync(
    process.execPath,
    [reactScripts, 'test', '--watchAll=false', `--moduleNameMapper=${JSON.stringify(moduleNameMapper)}`, ...process.argv.slice(2)],
    { cwd: sourceDir, stdio: 'inherit', env: { ...process.env, CI: 'true' } },
);

process.exit(result.status ?? 1);
