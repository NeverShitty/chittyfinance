#!/usr/bin/env node

import { detectMode, getModeConfig } from '../mode.config.js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const args = process.argv.slice(2);
const requestedMode = args.find(arg => arg.startsWith('--mode='))?.split('=')[1];
const shouldMigrate = args.includes('--migrate-data');
const shouldPreserve = args.includes('--preserve-system-data') || args.includes('--preserve-standalone-data');

const currentMode = detectMode();
const targetMode = requestedMode || currentMode;

console.log(`🔄 Setting up mode: ${targetMode}`);
console.log(`📊 Current mode: ${currentMode}`);

if (currentMode !== targetMode) {
  console.log(`🔄 Switching from ${currentMode} to ${targetMode}`);
  
  if (shouldMigrate) {
    console.log(`📦 Migration requested but not implemented yet`);
    // TODO: Implement data migration logic
  }
  
  if (shouldPreserve) {
    console.log(`💾 Data preservation requested but not implemented yet`);
    // TODO: Implement data preservation logic
  }
}

const config = getModeConfig(targetMode);

// Create mode-specific directories
try {
  mkdirSync(`client/${targetMode}`, { recursive: true });
  mkdirSync(`server/${targetMode}`, { recursive: true });
  mkdirSync(`database`, { recursive: true });
  mkdirSync(`deploy`, { recursive: true });
  
  console.log(`✅ Directories created for ${targetMode} mode`);
} catch (error) {
  console.log(`📁 Directories already exist or error:`, error.message);
}

// Set environment variable for current session
process.env.CHITTY_MODE = targetMode;

console.log(`✅ Mode setup complete: ${targetMode}`);
console.log(`🔧 Config:`, config);