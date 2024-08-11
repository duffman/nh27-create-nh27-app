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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const engine_1 = __importDefault(require("./core/engine"));
const dotenv = __importStar(require("dotenv"));
const cliUtils_1 = require("./utils/cliUtils");
const crypto = __importStar(require("crypto"));
dotenv.config();
const VERSION = "1.0.3";
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
                (0, cliUtils_1.logWarning)(`No input filename provided, attempting to find "data.json" in directory "${process.cwd()}"`);
            }
        }
        if (args[i] === '--session-id') {
            if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                sessionId = args[i + 1];
            }
            else {
                (0, cliUtils_1.logWarning)(`No session ID provided, generating a new session ID`);
            }
        }
    }
    return { file, sessionId };
}
function getFileHash(filePath) {
    if (!fs.existsSync(filePath)) {
        return '';
    }
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}
function runEngine(file, sessionId) {
    const filePath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
    (0, cliUtils_1.logInfo)(`Reading project structure from file: ${filePath}`);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const projectStructure = JSON.parse(rawData);
    if (sessionId) {
        projectStructure.sessionId = sessionId;
    }
    const engine = new engine_1.default();
    const result = engine.createProjectStructure(projectStructure);
    (0, cliUtils_1.logInfo)(`Result: ${JSON.stringify(result, null, 2)}`);
    if (result.success) {
        result.logs.forEach(cliUtils_1.logInfo);
        (0, cliUtils_1.logSuccess)(`Project structure created successfully with session ID: ${result.sessionId}`);
    }
    else {
        result.errors.forEach(cliUtils_1.logError);
        (0, cliUtils_1.logError)(`Failed to create project structure with session ID: ${result.sessionId}`);
    }
    // If this is not the first run, check if data.json has changed
    if (sessionId) {
        const newFileHash = getFileHash(filePath);
        const sessionFilePath = path.join(process.env.OUTPUT_DIR || 'generatedOutput', sessionId, 'data.json');
        const oldFileHash = getFileHash(sessionFilePath);
        if (newFileHash !== oldFileHash) {
            fs.writeFileSync(sessionFilePath, rawData, { flag: 'w' });
            (0, cliUtils_1.logInfo)(`data.json has changed and was updated in the session directory`);
        }
        else {
            (0, cliUtils_1.logInfo)(`data.json has not changed and was not updated`);
        }
    }
}
// Main script execution
(0, cliUtils_1.logInfo)(`Starting Create Directory Structure CLI v${VERSION}`);
try {
    const { file, sessionId } = parseCommandLineArgs();
    runEngine(file, sessionId);
}
catch (error) {
    (0, cliUtils_1.logError)(`Error reading project structure file: ${error.message}`);
}
//# sourceMappingURL=cli.js.map