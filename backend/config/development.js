export default {
  // Server Configuration
  NODE_ENV: 'development',
  PORT: 3000,
  CLINIC_PORT: 3001,
  FILES_PORT: 3002,

  // Database
  MONGODB_URI: 'mongodb+srv://suprith:suprith@cluster0.ojkrv.mongodb.net/clinic',

  // JWT
  JWT_SECRET: 'clinic-super-secret-jwt-key-for-development-only',
  JWT_EXPIRES_IN: '7d',

  // CORS
  CORS_ORIGIN: ['http://localhost:5173', 'http://localhost:3000'],
  CORS_CREDENTIALS: true,

  // Security
  BCRYPT_ROUNDS: 12,
  COOKIE_SECRET: 'clinic-cookie-secret-for-development',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,

  // File Upload
  MAX_FILE_SIZE: 10485760, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
};

