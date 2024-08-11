import * as fs from 'fs';
import * as path from 'path';
import { ProjectStructure } from './core/engine'; // Update with the correct import if necessary
import { logInfo, logError, logSuccess, logWarning } from './utils/cliUtils';
import { createProjectStructure } from './core/engine'; // Ensure you import correctly if the function is exported separately
import * as crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables from .env file
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

async function runEngine(file: string, sessionId?: string): Promise<void> {
    const filePath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
    logInfo(`Reading project structure from file: ${filePath}`);
    
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const projectStructure: ProjectStructure = JSON.parse(rawData);
    if (sessionId) {
        projectStructure.sessionId = sessionId;
    }

    try {
        const result = await createProjectStructure(projectStructure); // Ensure the function is async if needed

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
    } catch (error) {
        logError(`Error creating project structure: ${error.message}`);
    }
}

// Main script execution
logInfo(`Starting Create Directory Structure CLI v${VERSION}`);
try {
    const { file, sessionId } = parseCommandLineArgs();
    runEngine(file, sessionId).catch(err => logError(`Unexpected error: ${err.message}`));
} catch (error) {
    logError(`Error parsing command line arguments: ${error.message}`);
}
