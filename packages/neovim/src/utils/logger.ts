class Logger {

};

function setupLogger(): Logger {
  return new Logger();
}

export const logger: Logger = setupLogger();
