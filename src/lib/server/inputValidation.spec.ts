import { describe, it, expect } from 'vitest';
import {
  validateDocumentTitle,
  validateDocumentContent,
  validateAIPrompt,
  validateAPIResponse,
  validateDocumentID,
  validateDocumentFormData
} from './inputValidation';

describe('inputValidation', () => {
  describe('validateDocumentTitle', () => {
    it('should accept valid titles', () => {
      const result = validateDocumentTitle('My Document Title');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('My Document Title');
    });

    it('should reject empty titles', () => {
      const result = validateDocumentTitle('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject non-string titles', () => {
      const result = validateDocumentTitle(123);
      expect(result.valid).toBe(false);
    });

    it('should enforce 255 character limit', () => {
      const longTitle = 'a'.repeat(256);
      const result = validateDocumentTitle(longTitle);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('255');
    });

    it('should reject titles with null bytes', () => {
      const result = validateDocumentTitle('Title\0Injection');
      expect(result.valid).toBe(false);
    });

    it('should reject titles with script tags', () => {
      const result = validateDocumentTitle('Title <script>alert(1)</script>');
      expect(result.valid).toBe(false);
    });

    it('should reject titles with event handlers', () => {
      const result = validateDocumentTitle('Title onclick="alert(1)"');
      expect(result.valid).toBe(false);
    });

    it('should reject titles with javascript: protocol', () => {
      const result = validateDocumentTitle('javascript:alert(1)');
      expect(result.valid).toBe(false);
    });

    it('should trim whitespace from valid titles', () => {
      const result = validateDocumentTitle('  Valid Title  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Valid Title');
    });
  });

  describe('validateDocumentContent', () => {
    it('should accept valid content', () => {
      const content = 'This is a valid document content.';
      const result = validateDocumentContent(content);
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe(content);
    });

    it('should accept long content up to 1MB', () => {
      // Create 500KB string
      const content = 'a'.repeat(500000);
      const result = validateDocumentContent(content);
      expect(result.valid).toBe(true);
    });

    it('should reject content exceeding 1MB', () => {
      // Create 1MB + 1 byte string
      const content = 'a'.repeat(1048577);
      const result = validateDocumentContent(content);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('1MB');
    });

    it('should reject non-string content', () => {
      const result = validateDocumentContent({ text: 'not a string' });
      expect(result.valid).toBe(false);
    });

    it('should reject content with null bytes', () => {
      const result = validateDocumentContent('Content\0Injection');
      expect(result.valid).toBe(false);
    });

    it('should preserve document content as-is (user prose)', () => {
      const content = 'Once upon a time...\n\nWith newlines and special chars: !@#$%';
      const result = validateDocumentContent(content);
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe(content);
    });
  });

  describe('validateAIPrompt', () => {
    it('should accept valid prompts', () => {
      const result = validateAIPrompt('Can you help me improve this text?');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Can you help me improve this text?');
    });

    it('should reject empty prompts', () => {
      const result = validateAIPrompt('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should enforce 5000 character limit', () => {
      const longPrompt = 'a'.repeat(5001);
      const result = validateAIPrompt(longPrompt);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('5000');
    });

    it('should reject non-string prompts', () => {
      const result = validateAIPrompt(['not', 'a', 'string']);
      expect(result.valid).toBe(false);
    });

    it('should reject prompts with injection patterns', () => {
      const result = validateAIPrompt('<script>alert(1)</script>');
      expect(result.valid).toBe(false);
    });

    it('should reject prompts with excessively long tokens', () => {
      // Create a 501 character token
      const longToken = 'a'.repeat(501);
      const result = validateAIPrompt('Valid prompt ' + longToken + ' end');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('excessively long tokens');
    });

    it('should trim whitespace from valid prompts', () => {
      const result = validateAIPrompt('  Valid prompt  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Valid prompt');
    });

    it('should allow valid multi-sentence prompts', () => {
      const prompt = 'Can you help? I need assistance. Please provide feedback.';
      const result = validateAIPrompt(prompt);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateAPIResponse', () => {
    it('should accept valid response with expected keys', () => {
      const response = { success: true, id: '123' };
      const result = validateAPIResponse(response, ['success', 'id']);
      expect(result.valid).toBe(true);
    });

    it('should reject response missing required keys', () => {
      const response = { success: true };
      const result = validateAPIResponse(response, ['success', 'id']);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('id');
    });

    it('should reject non-object responses', () => {
      const result = validateAPIResponse('not an object', ['key']);
      expect(result.valid).toBe(false);
    });

    it('should reject null responses', () => {
      const result = validateAPIResponse(null, ['key']);
      expect(result.valid).toBe(false);
    });

    it('should accept response with extra keys', () => {
      const response = { success: true, id: '123', extra: 'data' };
      const result = validateAPIResponse(response, ['success', 'id']);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateDocumentID', () => {
    it('should accept valid UUID format', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      const result = validateDocumentID(validUUID);
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe(validUUID);
    });

    it('should accept uppercase UUID', () => {
      const validUUID = '550E8400-E29B-41D4-A716-446655440000';
      const result = validateDocumentID(validUUID);
      expect(result.valid).toBe(true);
    });

    it('should reject non-string IDs', () => {
      const result = validateDocumentID(123);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid UUID format', () => {
      const result = validateDocumentID('not-a-uuid');
      expect(result.valid).toBe(false);
    });

    it('should reject malformed UUIDs', () => {
      const result = validateDocumentID('550e8400-e29b-41d4-a716');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateDocumentFormData', () => {
    it('should accept valid form data', () => {
      const formData = new FormData();
      formData.append('id', '550e8400-e29b-41d4-a716-446655440000');
      formData.append('title', 'New Title');
      formData.append('content', 'New content');

      const result = validateDocumentFormData(formData);
      expect(result.valid).toBe(true);
    });

    it('should reject missing document ID', () => {
      const formData = new FormData();
      formData.append('title', 'Title');

      const result = validateDocumentFormData(formData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('ID');
    });

    it('should validate title if provided', () => {
      const formData = new FormData();
      formData.append('id', '550e8400-e29b-41d4-a716-446655440000');
      formData.append('title', '<script>alert(1)</script>');

      const result = validateDocumentFormData(formData);
      expect(result.valid).toBe(false);
    });

    it('should validate content if provided', () => {
      const formData = new FormData();
      formData.append('id', '550e8400-e29b-41d4-a716-446655440000');
      formData.append('content', 'a'.repeat(1048577)); // >1MB

      const result = validateDocumentFormData(formData);
      expect(result.valid).toBe(false);
    });

    it('should allow null title and content', () => {
      const formData = new FormData();
      formData.append('id', '550e8400-e29b-41d4-a716-446655440000');
      // No title or content

      const result = validateDocumentFormData(formData);
      expect(result.valid).toBe(true);
    });
  });

  describe('Injection Pattern Detection', () => {
    it('should detect vbscript: protocol', () => {
      const result = validateDocumentTitle('vbscript:alert(1)');
      expect(result.valid).toBe(false);
    });

    it('should detect CSS expression()', () => {
      const result = validateDocumentTitle('style: expression(alert(1))');
      expect(result.valid).toBe(false);
    });

    it('should detect eval()', () => {
      const result = validateAIPrompt('eval(malicious code)');
      expect(result.valid).toBe(false);
    });

    it('should detect onerror handler', () => {
      const result = validateDocumentTitle('onerror=alert(1)');
      expect(result.valid).toBe(false);
    });
  });
});
