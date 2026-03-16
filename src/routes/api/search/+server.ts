import { json, type RequestHandler } from '@sveltejs/kit';
import { db, isMock } from '$lib/server/db';
import { documents } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { search, indexDocument, searchWithFilters, type SearchFilter, type SearchDocument } from '$lib/server/search';
import { validateAIPrompt } from '$lib/server/inputValidation';
import { checkWriteRateLimit } from '$lib/server/rateLimitMiddleware';

interface SearchRequest {
  query: string;
  filters?: SearchFilter;
}

/**
 * POST /api/search
 * Search user's documents by query and filters
 */
export const POST: RequestHandler = async (event) => {
  // Rate limit (not a write, but resource-intensive)
  const limit = checkWriteRateLimit(event);
  if (!limit.allowed) {
    return limit.response!;
  }

  try {
    const body = await event.request.json();
    const { query, filters = {} } = body as SearchRequest;

    // Validate query
    if (!query || typeof query !== 'string') {
      return json(
        { error: 'Invalid query' },
        { status: 400 }
      );
    }

    const queryValidation = validateAIPrompt(query);
    if (!queryValidation.valid) {
      return json(
        { error: queryValidation.error },
        { status: 400 }
      );
    }

    const sanitizedQuery = queryValidation.sanitized as string;

    // Get user's documents
    let userDocuments: Array<SearchDocument & { tags?: string[]; updated_at?: number; created_at?: number }> = [];

    if (!isMock && db) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const typedDb = db as any;
        const userId = event.locals.user?.id;

        if (!userId) {
          return json(
            { error: 'Not authenticated' },
            { status: 401 }
          );
        }

        // Fetch user's documents (TODO: should use RBAC to get accessible docs)
        const docs = typedDb.select().from(documents).where(eq(documents.user_id, userId)).all();

        userDocuments = (docs || []).map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          tags: doc.tags ? JSON.parse(doc.tags) : [],
          updated_at: doc.updated_at,
          created_at: doc.created_at
        }));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[/api/search] DB error:', err);
        return json(
          { error: 'Failed to search documents' },
          { status: 500 }
        );
      }
    } else {
      // Mock mode: return empty results
      userDocuments = [];
    }

    // Execute search with filters
    const results = searchWithFilters(sanitizedQuery, userDocuments, filters);

    return json(results, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[/api/search] Error:', err);
    return json(
      { error: 'Search request failed' },
      { status: 500 }
    );
  }
};

/**
 * GET /api/search
 * Health check / endpoint info
 */
export const GET: RequestHandler = async () => {
  return json({
    message: 'Search API',
    methods: ['POST'],
    usage: 'POST with { query, filters? }'
  });
};
