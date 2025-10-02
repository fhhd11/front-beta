#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const configs = {
  'esbuild': 'vite.config.js',
  'simple': 'vite.config.simple.js'
};

const targetConfig = process.argv[2] || 'esbuild';

if (!configs[targetConfig]) {
  console.error(`Unknown config: ${targetConfig}`);
  console.error(`Available configs: ${Object.keys(configs).join(', ')}`);
  process.exit(1);
}

const sourceFile = path.join(__dirname, '..', configs[targetConfig]);
const targetFile = path.join(__dirname, '..', 'vite.config.js');

try {
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`✅ Switched to ${targetConfig} config`);
} catch (error) {
  console.error(`❌ Failed to switch config: ${error.message}`);
  process.exit(1);
}
