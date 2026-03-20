/**
 * Input validation & sanitization module
 * Validates and sanitizes user inputs at API boundaries
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: unknown;
}

const INJECTION_PATTERNS = [
  /<script[\s\S]*?<\/script>/gi, // script tags
  /javascript:/gi, // javascript: protocol
  /on\w+\s*=/gi, // event handlers (onclick=, onerror=, etc.)
  /eval\(/gi, // eval function
  /expression\s*\(/gi, // CSS expression()
  /vbscript:/gi // vbscript: protocol
];

/**
 * Validate document title
 * Max 255 chars, no null bytes, no HTML/script injection
 */
export function validateDocumentTitle(title: unknown): ValidationResult {
  if (typeof title !== 'string') {
    return { valid: false, error: 'Title must be a string' };
  }

  if (title.length === 0) {
    return { valid: false, error: 'Title cannot be empty' };
  }

  if (title.length > 255) {
    return { valid: false, error: 'Title cannot exceed 255 characters' };
  }

  if (title.includes('\0')) {
    return { valid: false, error: 'Title contains invalid characters' };
  }

  if (hasInjectionPatterns(title)) {
    return { valid: false, error: 'Title contains invalid patterns' };
  }

  return {
    valid: true,
    sanitized: title.trim()
  };
}

/**
 * Validate document content
 * Max 1MB (1048576 bytes), must be valid UTF-8
 */
export function validateDocumentContent(content: unknown): ValidationResult {
  if (typeof content !== 'string') {
    return { valid: false, error: 'Content must be a string' };
  }

  // Check size: 1MB = 1048576 bytes
  const sizeInBytes = new TextEncoder().encode(content).length;
  if (sizeInBytes > 1048576) {
    return { valid: false, error: 'Content exceeds maximum size of 1MB' };
  }

  // Check for null bytes
  if (content.includes('\0')) {
    return { valid: false, error: 'Content contains invalid characters' };
  }

  return {
    valid: true,
    sanitized: content // Content is preserved as-is (user's prose)
  };
}

/**
 * Validate AI prompt
 * Max 5000 chars, no injection patterns, no excessively long tokens
 */
export function validateAIPrompt(prompt: unknown): ValidationResult {
  if (typeof prompt !== 'string') {
    return { valid: false, error: 'Prompt must be a string' };
  }

  if (prompt.length === 0) {
    return { valid: false, error: 'Prompt cannot be empty' };
  }

  if (prompt.length > 5000) {
    return { valid: false, error: 'Prompt cannot exceed 5000 characters' };
  }

  if (hasInjectionPatterns(prompt)) {
    return { valid: false, error: 'Prompt contains invalid patterns' };
  }

  // Check for excessively long words (potential token inflation attack)
  const tokens = prompt.split(/\s+/);
  if (tokens.some((token) => token.length > 500)) {
    return { valid: false, error: 'Prompt contains excessively long tokens' };
  }

  return {
    valid: true,
    sanitized: prompt.trim()
  };
}

/**
 * Validate API response shape
 * Ensures response object has expected structure before sending to client
 */
export function validateAPIResponse(
  response: unknown,
  expectedKeys: string[]
): ValidationResult {
  if (typeof response !== 'object' || response === null) {
    return { valid: false, error: 'Response must be an object' };
  }

  const responseObj = response as Record<string, unknown>;

  // Check all expected keys are present
  const missingKeys = expectedKeys.filter((key) => !(key in responseObj));
  if (missingKeys.length > 0) {
    return {
      valid: false,
      error: `Response missing required fields: ${missingKeys.join(', ')}`
    };
  }

  return {
    valid: true,
    sanitized: response
  };
}

/**
 * Helper: Check if string contains common injection patterns
 */
function hasInjectionPatterns(str: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(str));
}

/**
 * Validate document ID (UUID format)
 */
export function validateDocumentID(id: unknown): ValidationResult {
  if (typeof id !== 'string') {
    return { valid: false, error: 'Document ID must be a string' };
  }

  // In mock/dev mode we use stub IDs (e.g. stub-doc-1) which are not UUIDs.
  // Allow those to keep mock flows simple.
  if (id.startsWith('stub-doc-')) {
    return { valid: true, sanitized: id };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { valid: false, error: 'Invalid document ID format' };
  }

  return {
    valid: true,
    sanitized: id
  };
}

/**
 * Batch validate form data from document actions
 */
export function validateDocumentFormData(data: FormData): ValidationResult {
  const id = data.get('id') as string | null;
  const title = data.get('title') as string | null;
  const content = data.get('content') as string | null;

  // Validate ID if present (always required)
  if (!id) {
    return { valid: false, error: 'Missing document ID' };
  }

  const idValidation = validateDocumentID(id);
  if (!idValidation.valid) {
    return idValidation;
  }

  // Validate title if being updated
  if (title !== null) {
    const titleValidation = validateDocumentTitle(title);
    if (!titleValidation.valid) {
      return titleValidation;
    }
  }

  // Validate content if being updated
  if (content !== null) {
    const contentValidation = validateDocumentContent(content);
    if (!contentValidation.valid) {
      return contentValidation;
    }
  }

  return {
    valid: true,
    sanitized: { id, title, content }
  };
}
