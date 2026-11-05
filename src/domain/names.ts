export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const MAX_NAME_LENGTH = 30;

export function normalizeName(raw: string): string {
  const name = raw.trim().replace(/\s+/g, ' ');
  if (name.length === 0) {
    throw new ValidationError('Name cannot be empty');
  }
  if (name.length > MAX_NAME_LENGTH) {
    throw new ValidationError('Name too long');
  }
  return name;
}
