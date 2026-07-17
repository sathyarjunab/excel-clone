import Joi from "joi";
import { envSchema } from "./validator/commonValidator.js";
import { logger } from "./logger.js";

export const validateEnv = () => {
  const result = envSchema.validate(process.env, {
    stripUnknown: true,
    abortEarly: true,
  });
  if (result.error) {
    for (const err of result.error.details) {
      logger.error(`${err.path.join(".")}: ${err.message}`);
    }

    logger.end();

    logger.on("finish", () => {
      process.exit(1);
    });
    return false;
  }
  return true;
};
