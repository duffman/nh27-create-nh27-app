import colors from 'colors';

export const logInfo = (message: string): void => {
    console.log(colors.blue(`[INFO] ${message}`));
};

export const logError = (message: string): void => {
    console.error(colors.red(`[ERROR] ${message}`));
};

export const logSuccess = (message: string): void => {
    console.log(colors.green(`[SUCCESS] ${message}`));
};

export const logWarning = (message: string): void => {
    console.log(colors.yellow(`[WARNING] ${message}`));
};

