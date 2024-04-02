const winston = require('winston');

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Define the logger
const logger = winston.createLogger({
  level: 'info', // Set the logging level
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp to log messages
    winston.format.json() // JSON format
  ),
  transports: [
    new winston.transports.Console(), // Log to the console
    new winston.transports.File({ filename: `logs/error-${getCurrentDate()}.log`, level: 'error', format: winston.format.combine(winston.format.timestamp(), winston.format.json()) }),
    new winston.transports.File({ filename: `logs/info-${getCurrentDate()}.log`, level: 'info', format: winston.format.combine(winston.format.timestamp(), winston.format.json()) }) // Log errors to a file
    // You can add more transports as needed
  ]
});

module.exports = logger;
