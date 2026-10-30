#!/usr/bin/env node
// PostToolUse hook: after Claude edits a .js file under source/src, run ESLint on that file only.
// Check-only (no --fix, no prettier) so it never rewrites code. Errors only (--quiet): the codebase
// has ~200 pre-existing warnings, so reporting them would be noise.
// Exit 2 feeds the ESLint output back to Claude; any other situation exits 0 silently.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
    let filePath;
    try {
        filePath = JSON.parse(input).tool_input?.file_path;
    } catch (e) {
        process.exit(0);
    }
    if (!filePath) process.exit(0);

    const projectDir = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..');
    const sourceDir = path.join(projectDir, 'source');
    const absPath = path.resolve(filePath);
    const relToSrc = path.relative(path.join(sourceDir, 'src'), absPath);

    if (relToSrc.startsWith('..') || path.isAbsolute(relToSrc) || !/\.jsx?$/.test(absPath)) process.exit(0);
    if (!fs.existsSync(absPath)) process.exit(0);

    const eslintBin = path.join(sourceDir, 'node_modules', 'eslint', 'bin', 'eslint.js');
    if (!fs.existsSync(eslintBin)) process.exit(0); // dependencies not installed; never install them here

    const result = spawnSync(process.execPath, [eslintBin, '--quiet', '--no-color', absPath], {
        cwd: sourceDir,
        encoding: 'utf8',
        timeout: 25000,
    });

    if (result.status === 1) {
        process.stderr.write(
            `ESLint errors in ${path.relative(projectDir, absPath)}. Fix them before continuing:\n${result.stdout}`,
        );
        process.exit(2);
    }
    process.exit(0);
});
