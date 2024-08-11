import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

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
    language: string;
    runtime: string;
    folderStructure: FileStructure;
    code: CodeFile[];
}

function log(message: string): void {
    console.log(`[INFO] ${message}`);
}

function validateProjectStructure(structure: ProjectStructure): void {
    if (!structure.language || !structure.runtime || !structure.folderStructure || !structure.code) {
        throw new Error('Invalid project structure');
    }
}

function createDirectories(basePath: string, structure: FileStructure): void {
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

function createFiles(basePath: string, codeFiles: CodeFile[]): void {
    codeFiles.forEach(file => {
        // Remove ROOT from the file path
        const relativeFilePath = file.path.replace(/^ROOT[\\/]/, '');
        const filePath = path.join(basePath, relativeFilePath, file.name);
        const unescapedSource = unescapeSource(file.sourceCode);
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

function createProjectStructure(projectStructure: ProjectStructure, rootPath?: string, sessionId?: string): void {
    validateProjectStructure(projectStructure);
    
    const outputDir = rootPath || process.env.OUTPUT_DIR || 'generatedOutput';
    const sessionDir = sessionId || generateRandomSessionId();
    const basePath = path.join(outputDir, sessionDir);

    try {
        createDirectories(basePath, projectStructure.folderStructure);
        createFiles(basePath, projectStructure.code);
        log(`Project structure created successfully at ${basePath}`);
    } catch (error) {
        console.error(`[ERROR] Error creating project structure: ${error.message}`);
    }
}

function parseCommandLineArgs(): { file: string } {
    const args = process.argv.slice(2);
    let file = 'data.json';  // Default filename

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--file') {
            if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                file = args[i + 1];
            } else {
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
    const projectStructure: ProjectStructure = JSON.parse(rawData);
    createProjectStructure(projectStructure);
} catch (error) {
    console.error(`[ERROR] Error reading project structure file: ${error.message}`);
}
