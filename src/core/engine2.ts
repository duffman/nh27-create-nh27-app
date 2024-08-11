import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config();

export interface FileStructure {
    name: string;
    type: 'directory' | 'file';
    children?: FileStructure[];
}

export interface CodeFile {
    name: string;
    path: string;
    sourceCode: string;
}

export interface ProjectStructure {
    sessionId?: string;
    language: string;
    runtime: string;
    folderStructure: FileStructure;
    code: CodeFile[];
}

export interface ResultModel {
    success: boolean;
    message: string;
    sessionId: string;
    logs: string[];
    errors: string[];
    createdDirectories: string[];
    createdFiles: string[];
}

class Engine {
    private logs: string[] = [];
    private errors: string[] = [];
    private createdDirectories: string[] = [];
    private createdFiles: string[] = [];

    private log(message: string): void {
        this.logs.push(`[INFO] ${message}`);
    }

    private errorLog(message: string): void {
        this.errors.push(`[ERROR] ${message}`);
    }

    private validateProjectStructure(structure: ProjectStructure): void {
        const errors: string[] = [];

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

    private getCurrentFileHash(filePath: string): string {
        if (!fs.existsSync(filePath)) {
            return '';
        }
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    }

    private createDirectories(basePath: string, structure: FileStructure): void {
        // Handle the ROOT alias by using basePath directly
        const currentPath = basePath;

        if (structure.type === 'directory') {
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath, { recursive: true });
                this.createdDirectories.push(currentPath);
                this.log(`Directory created: ${currentPath}`);
            }
            if (structure.children) {
                structure.children.forEach(child => this.createDirectories(path.join(currentPath, child.name), child));
            }
        } else {
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

    private backupFile(filePath: string, sessionDir: string): void {
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

    private createFiles(basePath: string, codeFiles: CodeFile[], sessionDir: string, overwrite: boolean = false): void {
        codeFiles.forEach(file => {
            const relativeFilePath = file.path.replace(/^ROOT[\\/]/, ''); // Ensure "ROOT" is removed from the path
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
                } else {
                    this.log(`File unchanged: ${filePath}`);
                    return;
                }
            } else {
                this.log(`File created: ${filePath}`);
            }

            fs.writeFileSync(filePath, unescapedSource, { flag: 'w' });
            this.createdFiles.push(filePath);
            this.log(`File written: ${filePath}`);
        });
    }

    private unescapeSource(source: string): string {
        return source.replace(/\\n/g, '\n')
                     .replace(/\\t/g, '\t')
                     .replace(/\\"/g, '"')
                     .replace(/\\\\/g, '\\')
                     .replace(/\\r/g, '\r');
    }

    private generateRandomSessionId(prefix: string = 'sess_'): string {
        return prefix + Math.random().toString(36).substr(2, 9);
    }

    public createProjectStructure(projectStructure: ProjectStructure, rootPath?: string): ResultModel {
        try {
            this.validateProjectStructure(projectStructure);
        } catch (error) {
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
        const basePath = sessionDir; // basePath is now sessionDir, treating it as the root directory

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
        } catch (error) {
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

export default Engine;
