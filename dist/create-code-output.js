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
const crypto = __importStar(require("crypto"));
// Load environment variables from .env file
dotenv.config();
const VERSION = "1.0.0";
function log(message) {
    console.log(`[INFO] ${message}`);
}
function errorLog(message) {
    console.error(`[ERROR] ${message}`);
}
function validateProjectStructure(structure) {
    const errors = [];
    if (!structure.language) {
        errors.push('Missing "language" field.');
    }
    if (!structure.runtime) {
        errors.push('Missing "runtime" field.');
    }
    if (!structure.sessionId) {
        errors.push('Missing "sessionId" field.');
    }
    if (!structure.folderStructure) {
        errors.push('Missing "folderStructure" field.');
    }
    if (!structure.code) {
        errors.push('Missing "code" field.');
    }
    if (structure.folderStructure && typeof structure.folderStructure !== 'object') {
        errors.push('"folderStructure" must be an object.');
    }
    if (structure.code && !Array.isArray(structure.code)) {
        errors.push('"code" must be an array.');
    }
    if (errors.length > 0) {
        throw new Error(`Invalid project structure:\n${errors.join('\n')}`);
    }
}
function getCurrentFileHash(filePath) {
    if (!fs.existsSync(filePath)) {
        return '';
    }
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}
function createDirectories(basePath, structure) {
    const currentPath = path.join(basePath, structure.name);
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
function backupFile(filePath, sessionDir) {
    const backupDir = path.join(sessionDir, '.backup');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
        log(`Backup directory created: ${backupDir}`);
    }
    const relativeFilePath = path.relative(sessionDir, filePath);
    const backupFilePath = path.join(backupDir, relativeFilePath);
    const backupFileDir = path.dirname(backupFilePath);
    if (!fs.existsSync(backupFileDir)) {
        fs.mkdirSync(backupFileDir, { recursive: true });
    }
    fs.copyFileSync(filePath, backupFilePath);
    log(`File backed up: ${filePath} to ${backupFilePath}`);
}
function createFiles(basePath, codeFiles, sessionDir, overwrite = false) {
    codeFiles.forEach(file => {
        const relativeFilePath = file.path.replace(/^ROOT[\\/]/, ''); // Remove ROOT from the path
        const filePath = path.join(basePath, relativeFilePath, file.name);
        const unescapedSource = unescapeSource(file.sourceCode);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            log(`Directory created: ${dir}`);
        }
        if (fs.existsSync(filePath) && !overwrite) {
            const currentHash = getCurrentFileHash(filePath);
            const newHash = crypto.createHash('sha256').update(unescapedSource).digest('hex');
            if (currentHash !== newHash) {
                log(`File modified: ${filePath}`);
                backupFile(filePath, sessionDir);
            }
            else {
                log(`File unchanged: ${filePath}`);
                return;
            }
        }
        else {
            log(`File created: ${filePath}`);
        }
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
function createProjectStructure(projectStructure, rootPath) {
    validateProjectStructure(projectStructure);
    const outputDir = rootPath || process.env.OUTPUT_DIR || 'generatedOutput';
    const sessionDir = path.join(outputDir, projectStructure.sessionId);
    const basePath = sessionDir;
    try {
        createDirectories(basePath, projectStructure.folderStructure);
        createFiles(basePath, projectStructure.code, sessionDir);
        log(`Project structure created successfully at ${basePath}`);
    }
    catch (error) {
        errorLog(`Error creating project structure: ${error.message}`);
    }
}
function parseCommandLineArgs() {
    const args = process.argv.slice(2);
    let file = 'data.json'; // Default filename
    let sessionId = undefined;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--file') {
            if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                file = args[i + 1];
            }
            else {
                log(`No input filename provided, attempting to find "data.json" in directory "${process.cwd()}"`);
            }
        }
        if (args[i] === '--session-id') {
            if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                sessionId = args[i + 1];
            }
            else {
                log(`No session ID provided, generating a new session ID`);
            }
        }
    }
    return { file, sessionId };
}
// Main script execution
log(`Starting Create Directory Structure Script v${VERSION}`);
try {
    const { file, sessionId } = parseCommandLineArgs();
    const filePath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
    log(`Reading project structure from file: ${filePath}`);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const projectStructure = JSON.parse(rawData);
    if (sessionId) {
        projectStructure.sessionId = sessionId;
    }
    createProjectStructure(projectStructure);
}
catch (error) {
    errorLog(`Error reading project structure file: ${error.message}`);
}
//# sourceMappingURL=create-code-output.js.map