import { describe, it, expect, vi } from 'vitest';

// Mock the DB layer so actions run in isMock mode
vi.mock('$lib/server/db', () => ({ db: null, isMock: true }));

import { actions } from './+page.server';

describe('settings actions', () => {
  it('savePreferences returns success for authenticated user', async () => {
    const req = { formData: async () => ({ get: (k: string) => JSON.stringify({ theme: 'dark' }) }) } as any;
    const res = await actions.savePreferences({ request: req, locals: { user: { id: 'test-user' } } } as any);
    expect(res).toEqual({ success: true });
  });
});
