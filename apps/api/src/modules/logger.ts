// @ts-check
import { inspect } from 'util';

type Msg = string | number | object | Error;
type Level = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

class Logger {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly msgTransformer: (level: Level, msg: Msg) => void) { }

  #formatObject(obj: object) {
    return inspect(obj, false, 999, true);
  }

  #format(level: Level, msgs: Msg[]) {
    const formattedMsgs: (string | number)[] = [];

    for (const msg of msgs) {
      if (typeof msg === 'object') {
        formattedMsgs.push(this.#formatObject(msg));
      } else {
        formattedMsgs.push(msg);
      }
    }

    return this.msgTransformer(level, formattedMsgs.join(' '));
  }

  info(...msg: Msg[]) {
    console.info(this.#format('INFO', msg));
  }

  debug(...msg: Msg[]) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.#format('DEBUG', msg));
    }
  }

  warn(...msg: Msg[]) {
    console.warn(this.#format('WARN', msg));
  }

  error(...msg: Msg[]) {
    console.error(this.#format('ERROR', msg));
  }
}

export const logger = new Logger((level, msg) => {
  const date = (new Date()).toISOString();

  return `[${level}/${date}]: ${msg}`;
});
