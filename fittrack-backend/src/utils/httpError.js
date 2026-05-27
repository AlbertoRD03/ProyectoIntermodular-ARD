export const createHttpError = (status, message, { expose } = {}) => {
  const error = new Error(message);
  error.status = status;
  error.expose = expose ?? status < 500;
  return error;
};

export const getErrorStatus = (error, fallbackStatus = 500) =>
  Number.isInteger(error?.status) ? error.status : fallbackStatus;

export const shouldExposeErrorMessage = (error) => Boolean(error?.expose);

