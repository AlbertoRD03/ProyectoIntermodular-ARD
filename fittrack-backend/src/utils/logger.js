const COLORS = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const toMessage = (value) => {
  if (value instanceof Error) return value.stack || value.message;
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

const buildLine = (level, color, args) => {
  const timestamp = new Date().toISOString();
  const message = args.map(toMessage).filter(Boolean).join(' ');
  return `${color}${timestamp} [FitTrack-Log] ${level}${message ? ` ${message}` : ''}${COLORS.reset}`;
};

export const info = (...args) => {
  console.log(buildLine('INFO', COLORS.blue, args));
};

export const success = (...args) => {
  console.log(buildLine('SUCCESS', COLORS.green, args));
};

export const error = (...args) => {
  console.error(buildLine('ERROR', COLORS.red, args));
};

export const warning = (...args) => {
  console.warn(buildLine('WARNING', COLORS.yellow, args));
};
