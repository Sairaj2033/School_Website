const fs = require('fs');
const path = require('path');

const validateEnv = () => {
  console.log('\nValidating Environment Variables...\n');
  
  const errors = [];
  const warnings = [];

  // ─── Required Variables ───────────────────────────────────────────
  const requiredVars = {
    MONGO_URL: {
      value: process.env.MONGO_URL,
      validator: (v) => {
        return v && (v.startsWith('mongodb://') || v.startsWith('mongodb+srv://'));
      },
      message: 'MONGO_URL must be a valid MongoDB connection string',
    },
    JWT_SECRET: {
      value: process.env.JWT_SECRET,
      validator: (v) => v && v.length >= 32,
      message: 'JWT_SECRET must be at least 32 characters long',
    },
  };

  const placeholders = [
    "your_jwt_secret_key_here",
    "your_email@gmail.com",
    "your_gmail_app_password",
    "your_mongodb_uri_here",
  ];

  // Validate required variables
  for (const [key, config] of Object.entries(requiredVars)) {
    const value = config.value || process.env[key];
    
    if (!value || placeholders.includes(value)) {
      errors.push(`${key} is required but not set or contains placeholder`);
      continue;
    }

    if (config.validator && !config.validator(value)) {
      errors.push(`${key}: ${config.message}`);
    }
  }

  // ─── Optional Variables with Type Checking ──────────────────────
  const optionalVars = {
    PORT: {
      value: process.env.PORT,
      type: 'number',
      default: 5000,
      validator: (v) => v >= 1000 && v <= 65535,
      message: 'PORT must be a number between 1000 and 65535',
    },
    NODE_ENV: {
      value: process.env.NODE_ENV,
      type: 'string',
      default: 'development',
      validator: (v) => ['development', 'production', 'test'].includes(v),
      message: 'NODE_ENV must be one of: development, production, test',
    },
    EMAIL_HOST: {
      value: process.env.EMAIL_HOST,
      type: 'string',
      default: 'smtp.gmail.com',
    },
    EMAIL_PORT: {
      value: process.env.EMAIL_PORT,
      type: 'number',
      default: 587,
      validator: (v) => v >= 1 && v <= 65535,
      message: 'EMAIL_PORT must be between 1 and 65535',
    },
    EMAIL_USER: {
      value: process.env.EMAIL_USER,
      type: 'string',
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'EMAIL_USER must be a valid email address',
    },
    EMAIL_PASS: {
      value: process.env.EMAIL_PASS,
      type: 'string',
      validator: (v) => v.length >= 8,
      message: 'EMAIL_PASS must be at least 8 characters',
    },
    FRONTEND_URL: {
      value: process.env.FRONTEND_URL,
      type: 'string',
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
    CLIENT_URL: {
      value: process.env.CLIENT_URL,
      type: 'string',
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
    JWT_EXPIRES_IN: {
      value: process.env.JWT_EXPIRES_IN,
      type: 'string',
      default: '7d',
      validator: (v) => /^\d+[dhm]$/.test(v),
      message: 'JWT_EXPIRES_IN must be in format: 1d, 12h, 30m',
    },
    REFRESH_TOKEN_SECRET: {
      value: process.env.REFRESH_TOKEN_SECRET,
      type: 'string',
      validator: (v) => v.length >= 32,
      message: 'REFRESH_TOKEN_SECRET must be at least 32 characters long',
    },
    RATE_LIMIT_WINDOW_MS: {
      value: process.env.RATE_LIMIT_WINDOW_MS,
      type: 'number',
      default: 900000,
      validator: (v) => v >= 60000,
      message: 'RATE_LIMIT_WINDOW_MS must be at least 60000 (1 minute)',
    },
    RATE_LIMIT_MAX_REQUESTS: {
      value: process.env.RATE_LIMIT_MAX_REQUESTS,
      type: 'number',
      default: 100,
      validator: (v) => v >= 1 && v <= 1000,
      message: 'RATE_LIMIT_MAX_REQUESTS must be between 1 and 1000',
    },
  };

  // Validate optional variables
  for (const [key, config] of Object.entries(optionalVars)) {
    let value = config.value || process.env[key];
    const isSet = value !== undefined && value !== '';

    if (!isSet && config.default !== undefined) {
      value = config.default;
      warnings.push(`${key} not set, using default: ${value}`);
    }

    if (!isSet) {
      warnings.push(`Optional var not set: ${key}`);
      continue;
    }

    // Type validation
    if (config.type) {
      let isValidType = true;
      if (config.type === 'number') {
        isValidType = !isNaN(parseFloat(value)) && isFinite(value);
      } else if (config.type === 'string') {
        isValidType = typeof value === 'string' || value instanceof String;
      }
      
      if (!isValidType) {
        errors.push(`${key} must be of type ${config.type}, got ${typeof value}`);
        continue;
      }

      // Convert type
      if (config.type === 'number') {
        value = parseFloat(value);
      }
    }

    // Custom validator
    if (config.validator && !config.validator(value)) {
      errors.push(`${key}: ${config.message}`);
    }
  }

  // ─── Production Security Checks ──────────────────────────────────
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production');
    }
    if (process.env.REFRESH_TOKEN_SECRET && process.env.REFRESH_TOKEN_SECRET.length < 32) {
      errors.push('REFRESH_TOKEN_SECRET must be at least 32 characters in production');
    }
    const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;
    if (clientUrl && !clientUrl.startsWith('https://')) {
      warnings.push('CLIENT_URL/FRONTEND_URL should use HTTPS in production');
    }
  }

  // ─── Output ───────────────────────────────────────────────────────
  if (warnings.length > 0) {
    console.warn('Warnings:');
    warnings.forEach((w) => console.warn(' ', w));
    console.log();
  }

  if (errors.length > 0) {
    console.error('Critical errors - server cannot start:');
    errors.forEach((e) => console.error(' ', e));
    console.log('\nEnvironment validation failed.');
    console.log('Please fix the errors above and restart the server.\n');
    process.exit(1);
  }

  console.log('Environment variables validated successfully.\n');
};

module.exports = validateEnv;