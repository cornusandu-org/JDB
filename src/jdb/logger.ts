import pino from "pino";

const logger = pino({
    transport: {
        target: "pino-pretty"
    }
});

logger.exception = logger.error;

export default logger;
