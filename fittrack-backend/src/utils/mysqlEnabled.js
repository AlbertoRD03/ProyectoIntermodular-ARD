export const isMySQLEnabled = () =>
  String(process.env.ENABLE_MYSQL || '').toLowerCase() === 'true';

export const isMySQLDisabledError = (error) =>
  Boolean(error?.message && String(error.message).includes('MySQL desactivado'));
