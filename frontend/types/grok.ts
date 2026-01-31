/**
 * Grok AI / xAI API Type Definitions
 */

// Symptom Analysis Types
export interface SymptomAnalysisRequest {
  symptoms: string;
  followUpAnswers?: Record<string, string>;
  context?: SymptomContext;
}

export interface SymptomContext {
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  existingConditions?: string[];
  medications?: string[];
  allergies?: string[];
}

export interface SymptomAnalysisResponse {
  analysis: string;
  recommendations: Recommendations;
  followUpQuestions?: FollowUpQuestion[];
  disclaimer: string;
  severity?: 'low' | 'medium' | 'high' | 'urgent';
  urgencyLevel?: number; // 1-10
}

export interface Recommendations {
  modalities: string[];
  herbs: string[];
  practitioners?: string[];
  lifestyle?: string[];
  dietary?: string[];
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  type: 'text' | 'choice' | 'number' | 'boolean';
  options?: string[];
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// xAI API Request/Response Types
export interface XAICompletionRequest {
  model: string;
  messages: XAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  stream?: boolean;
}

export interface XAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface XAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: XAIChoice[];
  usage: XAIUsage;
}

export interface XAIChoice {
  index: number;
  message: XAIMessage;
  finish_reason: string;
}

export interface XAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface XAIErrorResponse {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

// Content Summarization Types
export interface ContentSummarizationRequest {
  content: string;
  maxLength?: number;
  format?: 'paragraph' | 'bullets' | 'key_points';
}

export interface ContentSummarizationResponse {
  summary: string;
  keyPoints?: string[];
  originalLength: number;
  summaryLength: number;
}

// AI-Generated Insight Types
export interface AIInsight {
  id: string;
  type: 'symptom_analysis' | 'content_summary' | 'recommendation';
  content: string;
  confidence: number; // 0-1
  generatedAt: Date;
  model: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
}

// Caching Types for AI Responses
export interface CachedAIResponse {
  cacheKey: string;
  response: SymptomAnalysisResponse | ContentSummarizationResponse;
  cachedAt: Date;
  expiresAt: Date;
  hitCount: number;
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

// Analytics Types
export interface AIUsageMetrics {
  requestCount: number;
  totalTokens: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  period: {
    start: Date;
    end: Date;
  };
}
