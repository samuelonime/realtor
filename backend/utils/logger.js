'use strict';

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[process.env.LOG_LEVEL || 'info'] ?? 2;

const format = (level, msg) => {
  const ts = new Date().toISOString();
  return `[${ts}] [${level.toUpperCase()}] ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`;
};

const logger = {
  error: (msg) => currentLevel >= 0 && console.error(format('error', msg)),
  warn: (msg) => currentLevel >= 1 && console.warn(format('warn', msg)),
  info: (msg) => currentLevel >= 2 && console.log(format('info', msg)),
  debug: (msg) => currentLevel >= 3 && console.log(format('debug', msg)),
};

module.exports = logger;
