export function withReload<A extends unknown[]>(reload: () => Promise<void>, fn: (...args: A) => Promise<unknown>) {
  return async (...args: A): Promise<void> => {
    try {
      await fn(...args);
    } finally {
      await reload();
    }
  };
}
