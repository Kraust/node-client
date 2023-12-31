export class Logger {
  info(msg: string, ... $n: any[]) {
    console.log(msg);
  }
  error(msg: string, ... $n: any[]) {
    console.log(msg);
  }
  debug(msg: string, ... $n: any[]) {
    console.log(msg);
  }
};

function setupLogger(): Logger {
  return new Logger();
}

export const logger: Logger = setupLogger();
