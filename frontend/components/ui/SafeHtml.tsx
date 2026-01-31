'use client';

import { useMemo, type ElementType } from 'react';
import { sanitizeHtml } from '@/lib/sanitize';

type AllowedElements = 'div' | 'span' | 'p' | 'section' | 'article';

interface SafeHtmlProps {
  html: string;
  className?: string;
  as?: AllowedElements;
}

/**
 * Safely render HTML content with XSS protection
 *
 * This component sanitizes HTML before rendering to prevent XSS attacks.
 * The sanitizeHtml function removes dangerous elements like script tags,
 * event handlers, and javascript: URLs.
 *
 * Use this component instead of raw dangerouslySetInnerHTML for any
 * HTML content from external sources (CMS, user input, etc.)
 */
export function SafeHtml({ html, className, as = 'div' }: SafeHtmlProps) {
  // Sanitize HTML to remove XSS vectors before rendering
  const sanitizedHtml = useMemo(() => sanitizeHtml(html), [html]);

  const Component = as as ElementType;

  return (
    <Component
      className={className}
      // Safe to use here because content is sanitized above
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
