import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import simpleGit, { SimpleGit } from 'simple-git';

// Load environment variables from .env file
dotenv.config();

const VERSION = "1.1.4";

interface CodeFile {
    name: string;
    path: string;
    description: string;
    sourceKind: string;
    sourceCode: string;
}

interface Changes {
    summary: string;
    addedFiles: Array<{ path: string; name: string }>;
    modifiedFiles: Array<{ path: string; name: string }>;
    deletedFiles: Array<{ path: string; name: string }>;
}

interface ProjectStructure {
    language: string;
    runtime: string;
    sessionId?: string;
    code: {
        files: CodeFile[];
    };
    changes: Changes;
}

interface ResultModel {
    success: boolean;
    message: string;
    sessionId: string;
    logs: string[];
    errors: string[];
    createdDirectories: string[];
    createdFiles: string[];
}

class ProjectManager {
    private logs: string[] = [];
    private errors: string[] = [];
    private createdDirectories: string[] = [];
    private createdFiles: string[] = [];

    constructor(private projectStructure: ProjectStructure) {}

    private log(message: string): void {
        this.logs.push(`[INFO] ${message}`);
        console.log(`[INFO] ${message}`);
    }

    private errorLog(message: string): void {
        this.errors.push(`[ERROR] ${message}`);
        console.error(`[ERROR] ${message}`);
    }

    private validateProjectStructure(): void {
        const structure = this.projectStructure;
        if (!structure.language) {
            throw new Error('Invalid project structure: Missing language');
        }
        if (!structure.runtime) {
            throw new Error('Invalid project structure: Missing runtime');
        }
        if (!structure.code || !structure.code.files) {
            throw new Error('Invalid project structure: Missing code or code files');
        }
        if (!structure.changes) {
            throw new Error('Invalid project structure: Missing changes');
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

    private createDirectories(dirPath: string): void {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            this.createdDirectories.push(dirPath);
            this.log(`Directory created: ${dirPath}`);
        }
    }

    private backupFile(filePath: string, sessionDir: string): void {
        const backupDir = path.join(sessionDir, '.backup');
        this.createDirectories(backupDir);

        const relativeFilePath = path.relative(sessionDir, filePath);
        const backupFilePath = path.join(backupDir, relativeFilePath);
        const backupFileDir = path.dirname(backupFilePath);

        this.createDirectories(backupFileDir);
        fs.copyFileSync(filePath, backupFilePath);
        this.createdFiles.push(backupFilePath);
        this.log(`File backed up: ${filePath} to ${backupFilePath}`);
    }

    private createFiles(basePath: string, codeFiles: CodeFile[], sessionDir: string): void {
        codeFiles.forEach(file => {
            const relativeFilePath = file.path.replace(/^ROOT[\\/]/, ''); // Remove ROOT from the path
            const filePath = path.join(basePath, relativeFilePath, file.name);
            const unescapedSource = this.unescapeSource(file.sourceCode);
            const dir = path.dirname(filePath);

            this.createDirectories(dir);

            if (fs.existsSync(filePath)) {
                this.log(`File exists, modifying: ${filePath}`);
                this.backupFile(filePath, sessionDir);
            } else {
                this.log(`File created: ${filePath}`);
            }

            fs.writeFileSync(filePath, unescapedSource, { flag: 'w' });
            this.createdFiles.push(filePath);
            this.log(`File written: ${filePath} (${file.description})`);
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

    private async initializeGitRepo(sessionDir: string): Promise<SimpleGit> {
        const git: SimpleGit = simpleGit(sessionDir);
        await git.init();
        this.log(`Initialized a new Git repository in ${sessionDir}`);
        return git;
    }

    private async commitChanges(git: SimpleGit, message: string): Promise<void> {
        await git.add('./*');
        await git.commit(message);
        this.log(`Committed changes: ${message}`);
    }

    public async createProjectStructure(rootPath?: string): Promise<ResultModel> {
        try {
            this.validateProjectStructure();

            const outputDir = rootPath || process.env.OUTPUT_DIR || 'generatedOutput';
            const sessionId = this.projectStructure.sessionId || this.generateRandomSessionId();
            const sessionDir = path.join(outputDir, sessionId);
            const basePath = sessionDir;

            const git = await this.initializeGitRepo(sessionDir);

            this.createFiles(basePath, this.projectStructure.code.files, sessionDir);
            this.handleAddedFiles(basePath, this.projectStructure.changes.addedFiles);
            this.handleModifiedFiles(basePath, this.projectStructure.changes.modifiedFiles, this.projectStructure.code.files, sessionDir);
            this.handleDeletedFiles(basePath, this.projectStructure.changes.deletedFiles);

            await this.commitChanges(git, this.projectStructure.changes.summary || 'Updated project structure');

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
                sessionId: this.projectStructure.sessionId || this.generateRandomSessionId(),
                logs: this.logs,
                errors: this.errors,
                createdDirectories: this.createdDirectories,
                createdFiles: this.createdFiles
            };
        }
    }

    private handleAddedFiles(basePath: string, addedFiles: Array<{ path: string; name: string }>): void {
        addedFiles.forEach(file => {
            const filePath = path.join(basePath, file.path, file.name);
            if (!fs.existsSync(filePath)) {
                fs.closeSync(fs.openSync(filePath, 'w'));
                this.createdFiles.push(filePath);
                this.log(`Added file: ${filePath}`);
            } else {
                this.log(`File already exists: ${filePath}`);
            }
        });
    }

    private handleModifiedFiles(basePath: string, modifiedFiles: Array<{ path: string; name: string }>, codeFiles: CodeFile[], sessionDir: string): void {
        modifiedFiles.forEach(modFile => {
            const codeFile = codeFiles.find(f => f.name === modFile.name && f.path === modFile.path);
            if (codeFile) {
                const filePath = path.join(basePath, modFile.path, modFile.name);
                const unescapedSource = this.unescapeSource(codeFile.sourceCode);
                if (fs.existsSync(filePath)) {
                    this.backupFile(filePath, sessionDir);
                    fs.writeFileSync(filePath, unescapedSource, { flag: 'w' });
                    this.log(`Modified file: ${filePath}`);
                }
            }
        });
    }

    private handleDeletedFiles(basePath: string, deletedFiles: Array<{ path: string; name: string }>): void {
        deletedFiles.forEach(file => {
            const filePath = path.join(basePath, file.path, file.name);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                this.log(`Deleted file: ${filePath}`);
            }
        });
    }
}

export default ProjectManager;
