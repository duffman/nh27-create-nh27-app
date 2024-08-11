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
dotenv.config();
class Engine {
    constructor() {
        this.logs = [];
        this.errors = [];
        this.createdDirectories = [];
        this.createdFiles = [];
    }
    log(message) {
        this.logs.push(`[INFO] ${message}`);
    }
    errorLog(message) {
        this.errors.push(`[ERROR] ${message}`);
    }
    validateProjectStructure(structure) {
        const errors = [];
        if (!structure.language) {
            errors.push('Missing "language" field.');
        }
        if (!structure.runtime) {
            errors.push('Missing "runtime" field.');
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
    getCurrentFileHash(filePath) {
        if (!fs.existsSync(filePath)) {
            return '';
        }
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    }
    createDirectories(basePath, structure) {
        const currentPath = path.join(basePath, structure.name);
        if (structure.type === 'directory') {
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath, { recursive: true });
                this.createdDirectories.push(currentPath);
                this.log(`Directory created: ${currentPath}`);
            }
            if (structure.children) {
                structure.children.forEach(child => this.createDirectories(currentPath, child));
            }
        }
        else {
            const dir = path.dirname(currentPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.createdDirectories.push(dir);
                this.log(`Directory created: ${dir}`);
            }
            if (!fs.existsSync(currentPath)) {
                fs.closeSync(fs.openSync(currentPath, 'w'));
                this.createdFiles.push(currentPath);
                this.log(`File created: ${currentPath}`);
            }
        }
    }
    backupFile(filePath, sessionDir) {
        const backupDir = path.join(sessionDir, '.backup');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
            this.createdDirectories.push(backupDir);
            this.log(`Backup directory created: ${backupDir}`);
        }
        const relativeFilePath = path.relative(sessionDir, filePath);
        const backupFilePath = path.join(backupDir, relativeFilePath);
        const backupFileDir = path.dirname(backupFilePath);
        if (!fs.existsSync(backupFileDir)) {
            fs.mkdirSync(backupFileDir, { recursive: true });
            this.createdDirectories.push(backupFileDir);
        }
        fs.copyFileSync(filePath, backupFilePath);
        this.createdFiles.push(backupFilePath);
        this.log(`File backed up: ${filePath} to ${backupFilePath}`);
    }
    createFiles(basePath, codeFiles, sessionDir, overwrite = false) {
        codeFiles.forEach(file => {
            const relativeFilePath = file.path.replace(/^ROOT[\\/]/, ''); // Remove ROOT from the path
            const filePath = path.join(basePath, relativeFilePath, file.name);
            const unescapedSource = this.unescapeSource(file.sourceCode);
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.createdDirectories.push(dir);
                this.log(`Directory created: ${dir}`);
            }
            if (fs.existsSync(filePath) && !overwrite) {
                const currentHash = this.getCurrentFileHash(filePath);
                const newHash = crypto.createHash('sha256').update(unescapedSource).digest('hex');
                if (currentHash !== newHash) {
                    this.log(`File modified: ${filePath}`);
                    this.backupFile(filePath, sessionDir);
                }
                else {
                    this.log(`File unchanged: ${filePath}`);
                    return;
                }
            }
            else {
                this.log(`File created: ${filePath}`);
            }
            fs.writeFileSync(filePath, unescapedSource, { flag: 'w' });
            this.createdFiles.push(filePath);
            this.log(`File written: ${filePath}`);
        });
    }
    unescapeSource(source) {
        return source.replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\r/g, '\r');
    }
    generateRandomSessionId(prefix = 'sess_') {
        return prefix + Math.random().toString(36).substr(2, 9);
    }
    createProjectStructure(projectStructure, rootPath) {
        try {
            this.validateProjectStructure(projectStructure);
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                sessionId: projectStructure.sessionId || this.generateRandomSessionId(),
                logs: this.logs,
                errors: this.errors,
                createdDirectories: this.createdDirectories,
                createdFiles: this.createdFiles
            };
        }
        const outputDir = rootPath || process.env.OUTPUT_DIR || 'generatedOutput';
        const sessionId = projectStructure.sessionId || this.generateRandomSessionId();
        const sessionDir = path.join(outputDir, sessionId);
        const basePath = sessionDir;
        try {
            this.createDirectories(basePath, projectStructure.folderStructure);
            this.createFiles(basePath, projectStructure.code, sessionDir);
            this.log(`Project structure created successfully at ${basePath}`);
            return {
                success: true,
                message: 'Project structure created successfully.',
                sessionId: sessionId,
                logs: this.logs,
                errors: this.errors,
                createdDirectories: this.createdDirectories,
                createdFiles: this.createdFiles
            };
        }
        catch (error) {
            this.errorLog(`Error creating project structure: ${error.message}`);
            return {
                success: false,
                message: `Error creating project structure: ${error.message}`,
                sessionId: sessionId,
                logs: this.logs,
                errors: this.errors,
                createdDirectories: this.createdDirectories,
                createdFiles: this.createdFiles
            };
        }
    }
}
exports.default = Engine;
//# sourceMappingURL=engine.js.map