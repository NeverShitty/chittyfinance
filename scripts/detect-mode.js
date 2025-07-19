#!/usr/bin/env node

import { detectMode, getModeConfig } from '../mode.config.js';

const mode = detectMode();
const config = getModeConfig(mode);

console.log(`🔍 Detected mode: ${mode}`);
console.log(`📊 Config:`, config);

// Set detected mode for subsequent npm scripts
process.env.CHITTY_DETECTED_MODE = mode;

// Export for use in other scripts
export { mode, config };