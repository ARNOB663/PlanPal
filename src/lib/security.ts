import zxcvbn from 'zxcvbn';

export interface PasswordStrength {
  score: number;
  feedback: {
    warning: string;
    suggestions: string[];
  };
}

export const validatePassword = (password: string): PasswordStrength => {
  const result = zxcvbn(password);
  return {
    score: result.score,
    feedback: result.feedback
  };
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML/XML tags
    .trim();
};

export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const SECURITY_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireNumbers: true,
    requireSpecialChars: true,
    requireUppercase: true,
    requireLowercase: true
  }
};

export const validatePasswordStrength = (password: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  const { PASSWORD_REQUIREMENTS } = SECURITY_CONSTANTS;

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};