import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

// Load environment variables from .env file
dotenv.config();

const VERSION = "1.0.0";

interface FileStructure {
    name: string;
    type: 'directory' | 'file';
    children?: FileStructure[];
}

interface CodeFile {
    name: string;
    path: string;
    sourceCode: string;
}

interface ProjectStructure {
    sessionId: string;
    language: string;
    runtime: string;
    folderStructure: FileStructure;
    code: CodeFile[];
}

function log(message: string): void {
    console.log(`[INFO] ${message}`);
}

function errorLog(message: string): void {
    console.error(`[ERROR] ${message}`);
}

function validateProjectStructure(structure: ProjectStructure): void {
    const errors: string[] = [];

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

function getCurrentFileHash(filePath: string): string {
    if (!fs.existsSync(filePath)) {
        return '';
    }
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

function createDirectories(basePath: string, structure: FileStructure): void {
    const currentPath = path.join(basePath, structure.name);
    if (structure.type === 'directory') {
        if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath, { recursive: true });
            log(`Directory created: ${currentPath}`);
        }
        if (structure.children) {
            structure.children.forEach(child => createDirectories(currentPath, child));
        }
    } else {
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

function backupFile(filePath: string, sessionDir: string): void {
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

function createFiles(basePath: string, codeFiles: CodeFile[], sessionDir: string, overwrite: boolean = false): void {
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
            } else {
                log(`File unchanged: ${filePath}`);
                return;
            }
        } else {
            log(`File created: ${filePath}`);
        }

        fs.writeFileSync(filePath, unescapedSource, { flag: 'w' });
        log(`File written: ${filePath}`);
    });
}

function unescapeSource(source: string): string {
    return source.replace(/\\n/g, '\n')
                 .replace(/\\t/g, '\t')
                 .replace(/\\"/g, '"')
                 .replace(/\\\\/g, '\\')
                 .replace(/\\r/g, '\r');
}

function generateRandomSessionId(prefix: string = 'sess_'): string {
    return prefix + Math.random().toString(36).substr(2, 9);
}

function createProjectStructure(projectStructure: ProjectStructure, rootPath?: string): void {
    validateProjectStructure(projectStructure);
    
    const outputDir = rootPath || process.env.OUTPUT_DIR || 'generatedOutput';
    const sessionDir = path.join(outputDir, projectStructure.sessionId);
    const basePath = sessionDir;

    try {
        createDirectories(basePath, projectStructure.folderStructure);
        createFiles(basePath, projectStructure.code, sessionDir);
        log(`Project structure created successfully at ${basePath}`);
    } catch (error) {
        errorLog(`Error creating project structure: ${error.message}`);
    }
}

function parseCommandLineArgs(): { file: string, sessionId?: string } {
    const args = process.argv.slice(2);
    let file = 'data.json';  // Default filename
    let sessionId: string | undefined = undefined;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--file') {
            if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                file = args[i + 1];
            } else {
                log(`No input filename provided, attempting to find "data.json" in directory "${process.cwd()}"`);
            }
        }
        if (args[i] === '--session-id') {
            if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                sessionId = args[i + 1];
            } else {
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
    const projectStructure: ProjectStructure = JSON.parse(rawData);
    if (sessionId) {
        projectStructure.sessionId = sessionId;
    }
    createProjectStructure(projectStructure);
} catch (error) {
    errorLog(`Error reading project structure file: ${error.message}`);
}
