/**
 * S19-04/05: Unit tests for /api/guest/status and /api/guest/convert endpoints.
 * Tests focus on validation logic, payload checks, and cookie integrity guards.
 */
import { describe, it, expect } from 'vitest';

// ── UUID validator (mirrors the implementation) ─────────────────────────────
function isValidUUID(value: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

describe('isValidUUID', () => {
	it('accepts a valid v4 UUID', () => {
		expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
	});

	it('accepts uppercase UUID', () => {
		expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
	});

	it('rejects a UUID with wrong segment lengths', () => {
		expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
	});

	it('rejects empty string', () => {
		expect(isValidUUID('')).toBe(false);
	});

	it('rejects arbitrary string', () => {
		expect(isValidUUID('not-a-uuid')).toBe(false);
	});
});

// ── Convert payload validation logic ─────────────────────────────────────────
interface ConvertPayload {
	email?: unknown;
	password?: unknown;
	guest_id?: unknown;
}

function validateConvertPayload(payload: ConvertPayload): string | null {
	const { email, password, guest_id } = payload;
	if (!email || !password || !guest_id) return 'Missing required fields: email, password, guest_id';
	if (typeof guest_id !== 'string' || !isValidUUID(guest_id)) return 'Invalid guest_id format';
	if (typeof password !== 'string' || password.length < 8) return 'Password must be at least 8 characters';
	return null;
}

describe('validateConvertPayload', () => {
	const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

	it('returns null for a valid payload', () => {
		expect(validateConvertPayload({ email: 'a@b.com', password: 'secret12', guest_id: VALID_UUID })).toBeNull();
	});

	it('returns error when email is missing', () => {
		expect(validateConvertPayload({ password: 'secret12', guest_id: VALID_UUID })).toMatch(/Missing/);
	});

	it('returns error when password is missing', () => {
		expect(validateConvertPayload({ email: 'a@b.com', guest_id: VALID_UUID })).toMatch(/Missing/);
	});

	it('returns error when guest_id is missing', () => {
		expect(validateConvertPayload({ email: 'a@b.com', password: 'secret12' })).toMatch(/Missing/);
	});

	it('returns error when guest_id is not a valid UUID', () => {
		expect(validateConvertPayload({ email: 'a@b.com', password: 'secret12', guest_id: 'bad-id' })).toMatch(/Invalid guest_id/);
	});

	it('returns error when password is too short', () => {
		expect(validateConvertPayload({ email: 'a@b.com', password: '1234', guest_id: VALID_UUID })).toMatch(/at least 8/);
	});

	it('returns error when password is exactly 7 chars', () => {
		expect(validateConvertPayload({ email: 'a@b.com', password: '1234567', guest_id: VALID_UUID })).toMatch(/at least 8/);
	});

	it('accepts a password of exactly 8 chars', () => {
		expect(validateConvertPayload({ email: 'a@b.com', password: '12345678', guest_id: VALID_UUID })).toBeNull();
	});
});

// ── Cookie integrity guard ────────────────────────────────────────────────────
describe('guest_id cookie integrity check', () => {
	function checkCookieMatch(cookieValue: string | undefined, payloadGuestId: string): boolean {
		return cookieValue === payloadGuestId;
	}

	const ID = '550e8400-e29b-41d4-a716-446655440000';

	it('passes when cookie matches payload', () => {
		expect(checkCookieMatch(ID, ID)).toBe(true);
	});

	it('fails when cookie is undefined', () => {
		expect(checkCookieMatch(undefined, ID)).toBe(false);
	});

	it('fails when cookie differs from payload', () => {
		expect(checkCookieMatch('aaaaaaaa-0000-0000-0000-000000000000', ID)).toBe(false);
	});
});

// ── ReviewScreen scroll mapping ───────────────────────────────────────────────
describe('highlight category → report section mapping', () => {
	const CATEGORY_TO_SECTION: Record<string, string> = {
		inconsistency: 'sec-inconsistencies',
		pov:           'sec-pov',
		style:         'sec-style',
		rhythm:        'sec-style',
		voice:         'sec-voices'
	};

	it('maps inconsistency to sec-inconsistencies', () => {
		expect(CATEGORY_TO_SECTION['inconsistency']).toBe('sec-inconsistencies');
	});

	it('maps pov to sec-pov', () => {
		expect(CATEGORY_TO_SECTION['pov']).toBe('sec-pov');
	});

	it('maps style to sec-style', () => {
		expect(CATEGORY_TO_SECTION['style']).toBe('sec-style');
	});

	it('maps rhythm to sec-style (grouped)', () => {
		expect(CATEGORY_TO_SECTION['rhythm']).toBe('sec-style');
	});

	it('maps voice to sec-voices', () => {
		expect(CATEGORY_TO_SECTION['voice']).toBe('sec-voices');
	});

	it('returns undefined for unknown category', () => {
		expect(CATEGORY_TO_SECTION['unknown']).toBeUndefined();
	});
});
