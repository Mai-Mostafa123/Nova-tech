const prefix = '[Velora]';

export default {
  info: (message: string) => console.log(`\x1b[36m${prefix}\x1b[0m ${message}`),
  warn: (message: string) => console.warn(`\x1b[33m${prefix}\x1b[0m ${message}`),
  error: (message: string, err?: unknown) => console.error(`\x1b[31m${prefix}\x1b[0m ${message}`, err ?? ''),
};
