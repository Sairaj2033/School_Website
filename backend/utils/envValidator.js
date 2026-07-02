const fs = require('fs');
const path = require('path');

const envSchema = {
  PORT: {
    type: 'number',
    required: false,
    default: 5000,
    validator: (v) => v >= 1000 && v <= 65535,
    message: 'PORT must be a number between 1000 and 65535',
  },
  NODE_ENV: {
    type: 'string',
    required: false,
    default: 'development',
    validator: (v) => ['development', 'production', 'test'].includes(v),
    message: 'NODE_ENV must be one of: development, production, test',
  },
  MONGODB_URI: {
    type: 'string',
    required: true,
    validator: (v) => {
      return v.startsWith('mongodb://') || v.startsWith('mongodb+srv://');
    },
    message: 'MONGODB_URI must be a valid MongoDB connection string',
  },
  MONGODB_DB_NAME: {
    type: 'string',
    required: false,
    default: 'school_website',
    validator: (v) => v.length >= 3,
    message: 'MONGODB_DB_NAME must be at least 3 characters',
  },
  JWT_SECRET: {
    type: 'string',
    required: true,
    validator: (v) => v.length >= 32,
    message: 'JWT_SECRET must be at least 32 characters long',
  },
  JWT_EXPIRES_IN: {
    type: 'string',
    required: false,
    default: '7d',
    validator: (v) => /^\d+[dhm]$/.test(v),
    message: 'JWT_EXPIRES_IN must be in format: 1d, 12h, 30m',
  },
  REFRESH_TOKEN_SECRET: {
    type: 'string',
    required: true,
    validator: (v) => v.length >= 32,
    message: 'REFRESH_TOKEN_SECRET must be at least 32 characters long',
  },
  EMAIL_HOST: {
    type: 'string',
    required: false,
    default: 'smtp.gmail.com',
    validator: (v) => v.length > 0,
    message: 'EMAIL_HOST is required for email functionality',
  },
  EMAIL_PORT: {
    type: 'number',
    required: false,
    default: 587,
    validator: (v) => v >= 1 && v <= 65535,
    message: 'EMAIL_PORT must be between 1 and 65535',
  },
  EMAIL_USER: {
    type: 'string',
    required: false,
    validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    message: 'EMAIL_USER must be a valid email address',
  },
  EMAIL_PASS: {
    type: 'string',
    required: false,
    validator: (v) => v.length >= 8,
    message: 'EMAIL_PASS must be at least 8 characters',
  },
  EMAIL_FROM: {
    type: 'string',
    required: false,
    validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    message: 'EMAIL_FROM must be a valid email address',
  },
  CLIENT_URL: {
    type: 'string',
    required: false,
    default: 'http://localhost:5173',
    validator: (v) => {
      try {
        new URL(v);
        return true;
      } catch {
        return false;
      }
    },
    message: 'CLIENT_URL must be a valid URL',
  },
  FRONTEND_URL: {
    type: 'string',
    required: false,
    default: 'http://localhost:5173',
    validator: (v) => {
      try {
        new URL(v);
        return true;
      } catch {
        return false;
      }
    },
    message: 'FRONTEND_URL must be a valid URL',
  },
  RATE_LIMIT_WINDOW_MS: {
    type: 'number',
    required: false,
    default: 900000,
    validator: (v) => v >= 60000,
    message: 'RATE_LIMIT_WINDOW_MS must be at least 60000 (1 minute)',
  },
  RATE_LIMIT_MAX_REQUESTS: {
    type: 'number',
    required: false,
    default: 100,
    validator: (v) => v >= 1 && v <= 1000,
    message: 'RATE_LIMIT_MAX_REQUESTS must be between 1 and 1000',
  },
};

const validateType = (value, type) => {
  switch (type) {
    case 'number':
      return !isNaN(parseFloat(value)) && isFinite(value);
    case 'string':
      return typeof value === 'string' || value instanceof String;
    case 'boolean':
      return value === 'true' || value === 'false' || typeof value === 'boolean';
    default:
      return true;
  }
};

const convertType = (value, type) => {
  switch (type) {
    case 'number':
      return parseFloat(value);
    case 'boolean':
      return value === 'true' || value === true;
    default:
      return value;
  }
};

const validateEnv = () => {
  console.log('\nValidating Environment Variables...\n');
  
  const errors = [];
  const warnings = [];
  const env = {};

  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('.env file not found. Create one from .env.example');
    console.warn('Using default values where available\n');
  }

  for (const [key, config] of Object.entries(envSchema)) {
    let value = process.env[key];
    const isSet = value !== undefined && value !== '';

    if (config.required && !isSet) {
      errors.push(`${key} is required but not set in environment`);
      continue;
    }

    if (!isSet && config.default !== undefined) {
      value = config.default;
      warnings.push(`${key} not set, using default: ${value}`);
    }

    if (!isSet) continue;

    if (config.type && !validateType(value, config.type)) {
      errors.push(`${key} must be of type ${config.type}, got ${typeof value}`);
      continue;
    }

    const convertedValue = convertType(value, config.type);
    env[key] = convertedValue;

    if (config.validator && !config.validator(convertedValue)) {
      errors.push(`${key}: ${config.message}`);
      continue;
    }

    if (process.env.NODE_ENV === 'production') {
      if (key === 'JWT_SECRET' && convertedValue.length < 32) {
        errors.push(`${key} must be at least 32 characters in production`);
      }
      if (key === 'CLIENT_URL' && !convertedValue.startsWith('https://')) {
        warnings.push(`${key} should use HTTPS in production: ${convertedValue}`);
      }
      if (key === 'FRONTEND_URL' && !convertedValue.startsWith('https://')) {
        warnings.push(`${key} should use HTTPS in production: ${convertedValue}`);
      }
    }
  }

  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach(w => console.log(`   ${w}`));
    console.log();
  }

  if (errors.length > 0) {
    console.log('Validation Errors:');
    errors.forEach(e => console.log(`   ${e}`));
    console.log('\nEnvironment validation failed.');
    console.log('Please fix the errors above and restart the server.\n');
    process.exit(1);
  }

  console.log('All environment variables validated successfully.\n');
  return env;
};

const checkProductionSecurity = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('Production Mode Detected - Running Security Checks...');
    
    const checks = [
      { key: 'JWT_SECRET', minLength: 32, message: 'JWT_SECRET should be at least 32 characters' },
      { key: 'REFRESH_TOKEN_SECRET', minLength: 32, message: 'REFRESH_TOKEN_SECRET should be at least 32 characters' },
    ];

    checks.forEach(({ key, minLength, message }) => {
      if (process.env[key] && process.env[key].length < minLength) {
        console.warn(message);
      }
    });

    const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;
    if (clientUrl && !clientUrl.startsWith('https://')) {
      console.warn('Client URL should use HTTPS in production');
    }
  }
};

module.exports = {
  validateEnv,
  checkProductionSecurity,
  envSchema,
};

if (require.main === module) {
  validateEnv();
  checkProductionSecurity();
}