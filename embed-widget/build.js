/**
 * Build Script for Real Estate AI Chat Widget
 * 
 * This script builds and minifies the widget for production use.
 * Run with: node build.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  inputFile: 'chat-widget.js',
  outputFile: 'chat-widget.min.js',
  sourceMapFile: 'chat-widget.min.js.map',
  version: '1.0.0',
  buildDate: new Date().toISOString()
};

// Simple minification (remove comments, extra spaces, etc.)
function minifyCode(code) {
  return code
    // Remove single-line comments
    .replace(/\/\/.*$/gm, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove spaces around operators
    .replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1')
    // Remove spaces around colons
    .replace(/\s*:\s*/g, ':')
    // Remove trailing spaces
    .replace(/\s+$/gm, '')
    // Remove empty lines
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

// Replace API key with environment variable
function replaceApiKey(code) {
  const apiKey = process.env.SENSAY_API_KEY;
  
  if (!apiKey) {
    console.error('❌ SENSAY_API_KEY environment variable is required!');
    console.error('   Please set SENSAY_API_KEY=your_api_key_here');
    process.exit(1);
  }
  
  console.log(`🔑 Using API Key: ${apiKey.substring(0, 10)}...`);
  
  return code.replace(
    /{{SENSAY_API_KEY}}/g, 
    apiKey
  );
}

// Add build information
function addBuildInfo(code) {
  const buildInfo = `
// Real Estate AI Chat Widget v${CONFIG.version}
// Built: ${CONFIG.buildDate}
// Source: https://github.com/your-repo/real-estate-ai-widget
// License: MIT

${code}`;
  
  return buildInfo;
}

// Main build function
function build() {
  console.log('🏗️  Building Real Estate AI Chat Widget...');
  
  try {
    // Read input file
    const inputPath = path.join(__dirname, CONFIG.inputFile);
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${CONFIG.inputFile}`);
    }
    
    let code = fs.readFileSync(inputPath, 'utf8');
    console.log(`📖 Read ${CONFIG.inputFile} (${code.length} characters)`);
    
    // Replace API key with environment variable
    const codeWithApiKey = replaceApiKey(code);
    
    // Minify code
    const minified = minifyCode(codeWithApiKey);
    console.log(`✂️  Minified to ${minified.length} characters (${Math.round((1 - minified.length / code.length) * 100)}% reduction)`);
    
    // Add build information
    const finalCode = addBuildInfo(minified);
    
    // Write output file
    const outputPath = path.join(__dirname, CONFIG.outputFile);
    fs.writeFileSync(outputPath, finalCode);
    console.log(`💾 Wrote ${CONFIG.outputFile}`);
    
    // Generate source map (basic)
    const sourceMap = {
      version: 3,
      sources: [CONFIG.inputFile],
      names: [],
      mappings: 'AAAA;',
      file: CONFIG.outputFile,
      sourceRoot: ''
    };
    
    const sourceMapPath = path.join(__dirname, CONFIG.sourceMapFile);
    fs.writeFileSync(sourceMapPath, JSON.stringify(sourceMap, null, 2));
    console.log(`🗺️  Generated source map`);
    
    // Create build info
    const buildInfo = {
      version: CONFIG.version,
      buildDate: CONFIG.buildDate,
      inputFile: CONFIG.inputFile,
      outputFile: CONFIG.outputFile,
      sourceMapFile: CONFIG.sourceMapFile,
      originalSize: code.length,
      minifiedSize: minified.length,
      reduction: Math.round((1 - minified.length / code.length) * 100)
    };
    
    const buildInfoPath = path.join(__dirname, 'build-info.json');
    fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
    console.log(`📊 Created build info`);
    
    console.log('\n✅ Build completed successfully!');
    console.log(`📦 Output: ${CONFIG.outputFile}`);
    console.log(`📏 Size: ${minified.length} characters (${Math.round(minified.length / 1024 * 100) / 100} KB)`);
    console.log(`📈 Reduction: ${buildInfo.reduction}%`);
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run build if this file is executed directly
if (require.main === module) {
  build();
}

module.exports = { build, minifyCode, addBuildInfo, replaceApiKey };
