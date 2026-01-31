/**
 * Next.js Instrumentation
 *
 * This file runs once when the Next.js server starts.
 * Used for environment validation and initialization tasks.
 */

export async function register() {
  // Only run on server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateServerEnv, logEnvSummary } = await import('@/lib/env');

    try {
      // Validate environment variables at startup
      validateServerEnv();

      // Log configuration summary in development
      if (process.env.NODE_ENV === 'development') {
        logEnvSummary();
      }

      console.log('Server initialized successfully');
    } catch (error) {
      console.error('Failed to initialize server:', error);
      // In production, this will prevent the server from starting with bad config
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
}
