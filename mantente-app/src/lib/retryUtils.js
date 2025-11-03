export const retryWithExponentialBackoff = async (
  fn,
  maxRetries = 3,
  initialDelayMs = 1000
) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        console.warn(
          `⚠️ Intento ${attempt}/${maxRetries} falló. Reintentando en ${delay}ms:`,
          error.message
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

export const createDebouncer = (fn, delayMs = 500) => {
  let timeoutId;
  
  return function debounced(...args) {
    clearTimeout(timeoutId);
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(fn(...args));
      }, delayMs);
    });
  };
};

export const createThrottler = (fn, delayMs = 1000) => {
  let lastCallTime = 0;
  let timeoutId;
  let lastArgs;
  
  return function throttled(...args) {
    const now = Date.now();
    lastArgs = args;
    
    if (now - lastCallTime >= delayMs) {
      lastCallTime = now;
      return fn(...args);
    } else {
      clearTimeout(timeoutId);
      return new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          lastCallTime = Date.now();
          resolve(fn(...lastArgs));
        }, delayMs - (now - lastCallTime));
      });
    }
  };
};

export const isConnectionError = (error) => {
  if (!error) return false;
  
  const message = error.message || '';
  const errorString = error.toString() || '';
  
  return (
    message.includes('Failed to fetch') ||
    message.includes('ERR_CONNECTION_CLOSED') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ETIMEDOUT') ||
    message.includes('ENOTFOUND') ||
    errorString.includes('network') ||
    errorString.includes('Network request failed')
  );
};
