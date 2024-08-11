import * as fs from 'fs';
import * as path from 'path';
import Engine, { ProjectStructure, ResultModel } from './core/engine3';
import * as dotenv from 'dotenv';
import { logInfo, logError, logSuccess, logWarning } from './utils/cliUtils';
import * as crypto from 'crypto';

dotenv.config();

const VERSION = "1.0.3";

function parseCommandLineArgs(): { file: string, sessionId?: string } {
    const args = process.argv.slice(2);
    let file = 'data.json';  // Default filename
    let sessionId: string | undefined = undefined;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--file') {
            if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                file = args[i + 1];
            } else {
                logWarning(`No input filename provided, attempting to find "data.json" in directory "${process.cwd()}"`);
            }
        }
        if (args[i] === '--session-id') {
            if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                sessionId = args[i + 1];
            } else {
                logWarning(`No session ID provided, generating a new session ID`);
            }
        }
    }

    return { file, sessionId };
}

function getFileHash(filePath: string): string {
    if (!fs.existsSync(filePath)) {
        return '';
    }
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

function runEngine(file: string, sessionId?: string): void {
    const filePath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
    logInfo(`Reading project structure from file: ${filePath}`);
    
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const projectStructure: ProjectStructure = JSON.parse(rawData);
    if (sessionId) {
        projectStructure.sessionId = sessionId;
    }

    const engine = new Engine();
    const result: ResultModel = engine.createProjectStructure(projectStructure);

    logInfo(`Result: ${JSON.stringify(result, null, 2)}`);

    if (result.success) {
        result.logs.forEach(logInfo);
        logSuccess(`Project structure created successfully with session ID: ${result.sessionId}`);
    } else {
        result.errors.forEach(logError);
        logError(`Failed to create project structure with session ID: ${result.sessionId}`);
    }

    // If this is not the first run, check if data.json has changed
    if (sessionId) {
        const newFileHash = getFileHash(filePath);
        const sessionFilePath = path.join(process.env.OUTPUT_DIR || 'generatedOutput', sessionId, 'data.json');
        const oldFileHash = getFileHash(sessionFilePath);
        if (newFileHash !== oldFileHash) {
            fs.writeFileSync(sessionFilePath, rawData, { flag: 'w' });
            logInfo(`data.json has changed and was updated in the session directory`);
        } else {
            logInfo(`data.json has not changed and was not updated`);
        }
    }
}

// Main script execution
logInfo(`Starting Create Directory Structure CLI v${VERSION}`);
try {
    const { file, sessionId } = parseCommandLineArgs();
    runEngine(file, sessionId);
} catch (error) {
    logError(`Error reading project structure file: ${error.message}`);
}
