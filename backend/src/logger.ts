import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "warn" }),
    new winston.transports.Console({ level: "info" }),
  ],
});
