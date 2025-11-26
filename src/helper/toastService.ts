// toastService.ts
let showToastFn: ((message: string, tipo: 'success' | 'error') => void) | null = null;

export const registerToastHandler = (fn: typeof showToastFn) => {
  showToastFn = fn;
};

export const showToastOutsider = (message: string, tipo: 'success' | 'error') => {
  if (showToastFn) {
    showToastFn(message, tipo);
  }
};
