import winston from 'winston';
import chalk from 'chalk';

// Winston logger yapılandırması
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(({ timestamp, level, message }) => {
            let coloredLevel;
            switch (level) {
                case 'error':
                    coloredLevel = chalk.red.bold(level.toUpperCase());
                    break;
                case 'warn':
                    coloredLevel = chalk.yellow.bold(level.toUpperCase());
                    break;
                case 'info':
                    coloredLevel = chalk.blue.bold(level.toUpperCase());
                    break;
                case 'debug':
                    coloredLevel = chalk.gray.bold(level.toUpperCase());
                    break;
                default:
                    coloredLevel = level.toUpperCase();
            }
            return `${chalk.green(timestamp)} [${coloredLevel}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console({
            handleExceptions: true
        })
    ],
    exitOnError: false
});

// Uncaught exception ve unhandled rejection'ları yakala
process.on('uncaughtException', (error) => {
    logger.error('Beklenmeyen Hata:', error);
    // Uygulamayı güvenli bir şekilde sonlandır
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('İşlenmeyen Promise Reddi:', reason);
});

// Yardımcı metodlar
const logAuth = (type, message) => {
    logger.info(`[AUTH] [${type}] ${message}`);
};

const logDB = (operation, message) => {
    logger.info(`[DB] [${operation}] ${message}`);
};

const logAPI = (method, path, status, message) => {
    logger.info(`[API] ${method} ${path} [${status}] ${message}`);
};

const logError = (component, error) => {
    logger.error(`[${component}] ${error.message}`);
    if (error.stack) {
        logger.debug(error.stack);
    }
};

export default {
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
    debug: logger.debug.bind(logger),
    auth: logAuth,
    db: logDB,
    api: logAPI,
    logError: logError
};
