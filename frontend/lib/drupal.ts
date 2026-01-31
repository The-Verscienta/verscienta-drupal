import { DrupalClient } from 'next-drupal';

// Initialize Drupal client with OAuth authentication (if credentials are available)
const clientId = process.env.DRUPAL_CLIENT_ID;
const clientSecret = process.env.DRUPAL_CLIENT_SECRET;

export const drupal = new DrupalClient(
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || 'https://backend.ddev.site',
  {
    frontPage: '/',
    // Only include auth if both credentials are provided
    ...(clientId && clientSecret
      ? {
          auth: {
            clientId,
            clientSecret,
          },
        }
      : {}),
    // Enable debug mode in development
    debug: process.env.NODE_ENV === 'development',
    // Set custom headers
    headers: {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    },
  }
);

// Export types for authentication
export interface DrupalUser {
  id: string;
  name: string;
  mail: string;
  roles: string[];
  field_first_name?: string;
  field_last_name?: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}
