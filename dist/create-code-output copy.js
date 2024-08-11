"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables from .env file
dotenv.config();
const VERSION = "1.0.0";
function log(message) {
    console.log(`[INFO] ${message}`);
}
function validateProjectStructure(structure) {
    if (!structure.language || !structure.runtime || !structure.folderStructure || !structure.code) {
        throw new Error('Invalid project structure');
    }
}
function createDirectories(basePath, structure) {
    // Handle the ROOT alias by ignoring it in the path
    const currentPath = structure.name === 'ROOT' ? basePath : path.join(basePath, structure.name);
    if (structure.type === 'directory') {
        if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath, { recursive: true });
            log(`Directory created: ${currentPath}`);
        }
        if (structure.children) {
            structure.children.forEach(child => createDirectories(currentPath, child));
        }
    }
    else {
        const dir = path.dirname(currentPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            log(`Directory created: ${dir}`);
        }
        if (!fs.existsSync(currentPath)) {
            fs.closeSync(fs.openSync(currentPath, 'w'));
            log(`File created: ${currentPath}`);
        }
    }
}
function createFiles(basePath, codeFiles) {
    codeFiles.forEach(file => {
        // Remove ROOT from the file path
        const relativeFilePath = file.path.replace(/^ROOT[\\/]/, '');
        const filePath = path.join(basePath, relativeFilePath, file.name);
        const unescapedSource = unescapeSource(file.sourceCode);
        fs.writeFileSync(filePath, unescapedSource, { flag: 'w' });
        log(`File written: ${filePath}`);
    });
}
function unescapeSource(source) {
    return source.replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\r/g, '\r');
}
function generateRandomSessionId(prefix = 'sess_') {
    return prefix + Math.random().toString(36).substr(2, 9);
}
function createProjectStructure(projectStructure, rootPath, sessionId) {
    validateProjectStructure(projectStructure);
    const outputDir = rootPath || process.env.OUTPUT_DIR || 'generatedOutput';
    const sessionDir = sessionId || generateRandomSessionId();
    const basePath = path.join(outputDir, sessionDir);
    try {
        createDirectories(basePath, projectStructure.folderStructure);
        createFiles(basePath, projectStructure.code);
        log(`Project structure created successfully at ${basePath}`);
    }
    catch (error) {
        console.error(`[ERROR] Error creating project structure: ${error.message}`);
    }
}
function parseCommandLineArgs() {
    const args = process.argv.slice(2);
    let file = 'data.json'; // Default filename
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--file') {
            if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                file = args[i + 1];
            }
            else {
                log(`No input filename provided, attempting to find "data.json" in directory "${process.cwd()}"`);
            }
        }
    }
    return { file };
}
// Main script execution
log(`Starting Create Directory Structure Script v${VERSION}`);
try {
    const { file } = parseCommandLineArgs();
    const filePath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
    log(`Reading project structure from file: ${filePath}`);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const projectStructure = JSON.parse(rawData);
    createProjectStructure(projectStructure);
}
catch (error) {
    console.error(`[ERROR] Error reading project structure file: ${error.message}`);
}
//# sourceMappingURL=create-code-output%20copy.js.map