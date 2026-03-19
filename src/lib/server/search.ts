/**
 * Full-text search engine
 * Indexes documents by title + content for fast searching
 * Performance target: <200ms for typical queries on 100+ documents
 */

export interface SearchResult {
  docId: string;
  title: string;
  snippet: string; // matching excerpt with context
  score: number; // relevance score (0-100)
  highlights: Array<{ start: number; end: number }>; // positions of matches in snippet
}

export interface SearchDocument {
  id: string;
  title: string;
  content: string;
}

const MAX_CONTENT_WORDS = 1000000; // ~5MB of text; don't truncate for search completeness
const SNIPPET_LENGTH = 150;
const WORD_BOUNDARY_REGEX = /\b/g;

/**
 * Build search index from document
 * Returns indexed document with searchable text (title + truncated content)
 */
export function indexDocument(doc: SearchDocument): {
  id: string;
  titleLower: string;
  contentLower: string;
  originalTitle: string;
  originalContent: string;
} {
  const contentTruncated = truncateContent(doc.content, MAX_CONTENT_WORDS);

  return {
    id: doc.id,
    titleLower: doc.title.toLowerCase(),
    contentLower: contentTruncated.toLowerCase(),
    originalTitle: doc.title,
    originalContent: doc.content
  };
}

/**
 * Execute search query against indexed documents
 * Supports phrase search with quotes and simple substring matching
 */
export function search(
  query: string,
  indexedDocs: ReturnType<typeof indexDocument>[]
): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const queryLower = query.toLowerCase();
  const isPhrase = query.startsWith('"') && query.endsWith('"');
  const searchTerm = isPhrase ? queryLower.slice(1, -1) : queryLower;

  const results: SearchResult[] = indexedDocs
    .map((doc) => {
      const titleScore = calculateScore(doc.titleLower, searchTerm, isPhrase, true);
      const contentScore = calculateScore(doc.contentLower, searchTerm, isPhrase, false);

      // Title matches weighted higher (3x)
      const totalScore = titleScore * 3 + contentScore;

      if (totalScore === 0) {
        return null;
      }

      // Extract snippet with highlights
      const snippet = extractSnippet(
        doc.originalContent,
        searchTerm,
        isPhrase,
        SNIPPET_LENGTH
      );

      return {
        docId: doc.id,
        title: doc.originalTitle,
        snippet: snippet.text,
        score: Math.min(100, Math.round(totalScore)),
        highlights: snippet.highlights
      };
    })
    .filter((r): r is SearchResult => r !== null)
    .sort((a, b) => b.score - a.score); // Sort by relevance

  return results;
}

/**
 * Calculate relevance score for a search term
 * Higher score for exact matches or early matches
 */
function calculateScore(
  text: string,
  searchTerm: string,
  isPhrase: boolean,
  isTitle: boolean
): number {
  if (!searchTerm || !text.includes(searchTerm)) {
    return 0;
  }

  let score = 1;

  if (isPhrase) {
    // Exact phrase: higher score
    score = 5;
  } else {
    // Substring match: score based on position and frequency
    const firstIndex = text.indexOf(searchTerm);
    if (firstIndex === 0) score = 3; // Starts with search term
    else if (firstIndex < 50) score = 2; // Early in text
    else score = 1; // Later in text

    // Bonus for each additional match (frequency)
    const matches = countMatches(text, searchTerm);
    score += Math.min(matches - 1, 2); // Cap at +2 for frequency
  }

  // Title gets inherent boost (already done at caller level)
  return score;
}

/**
 * Count how many times searchTerm appears in text
 */
function countMatches(text: string, searchTerm: string): number {
  if (!text || !searchTerm) return 0;
  const regex = new RegExp(escapeRegex(searchTerm), 'gi');
  return (text.match(regex) || []).length;
}

/**
 * Extract a snippet from content around the search term
 * Include context before and after, highlight matches
 */
function extractSnippet(
  content: string,
  searchTerm: string,
  isPhrase: boolean,
  maxLength: number
): { text: string; highlights: Array<{ start: number; end: number }> } {
  if (!searchTerm || !content) {
    return { text: content.slice(0, maxLength), highlights: [] };
  }

  const lowerContent = content.toLowerCase();
  const searchTermLower = searchTerm.toLowerCase();

  // Find first match
  const firstMatchIndex = lowerContent.indexOf(searchTermLower);
  if (firstMatchIndex === -1) {
    return { text: content.slice(0, maxLength), highlights: [] };
  }

  // Extract context around match
  const contextStart = Math.max(0, firstMatchIndex - 50);
  const contextEnd = Math.min(content.length, firstMatchIndex + searchTerm.length + 100);
  let snippet = content.slice(contextStart, contextEnd);

  // Add ellipsis if truncated
  if (contextStart > 0) snippet = '...' + snippet;
  if (contextEnd < content.length) snippet = snippet + '...';

  // Truncate to maxLength
  if (snippet.length > maxLength) {
    snippet = snippet.slice(0, maxLength) + '...';
  }

  // Find all matches in snippet for highlighting
  const highlights: Array<{ start: number; end: number }> = [];
  const snippetLower = snippet.toLowerCase();
  const regex = new RegExp(escapeRegex(searchTermLower), 'gi');
  let match;

  while ((match = regex.exec(snippetLower)) !== null) {
    highlights.push({
      start: match.index,
      end: match.index + searchTerm.length
    });
  }

  return { text: snippet, highlights };
}

/**
 * Truncate content to word count (for indexing)
 */
function truncateContent(content: string, maxWords: number): string {
  const words = content.split(/\s+/);
  if (words.length <= maxWords) {
    return content;
  }
  return words.slice(0, maxWords).join(' ');
}

/**
 * Escape special regex characters for safe regex matching
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Search with advanced filters
 */
export interface SearchFilter {
  tags?: string[]; // AND logic: doc must have all tags
  dateRangeStart?: number; // milliseconds
  dateRangeEnd?: number; // milliseconds
  sortBy?: 'score' | 'date_modified' | 'date_created' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchableDocument extends SearchDocument {
  tags?: string[];
  updated_at?: number;
  created_at?: number;
}

/**
 * Search with advanced filtering
 */
export function searchWithFilters(
  query: string,
  documents: SearchableDocument[],
  filters: SearchFilter = {}
): SearchResult[] {
  // First, get search results
  const indexed = documents.map(indexDocument);
  // For empty query, return all documents (for filtering/sorting)
  const results = query.trim()
    ? search(query, indexed)
    : indexed.map(doc => ({
        docId: doc.id,
        title: doc.originalTitle,
        snippet: doc.originalContent.slice(0, SNIPPET_LENGTH),
        score: 0,
        highlights: []
      }));

  // Apply tag filter (AND logic)
  if (filters.tags && filters.tags.length > 0) {
    return results.filter((result) => {
      const doc = documents.find((d) => d.id === result.docId);
      if (!doc) return false;
      return filters.tags!.every((tag) => doc.tags?.includes(tag));
    });
  }

  // Apply date range filter
  if (filters.dateRangeStart || filters.dateRangeEnd) {
    return results.filter((result) => {
      const doc = documents.find((d) => d.id === result.docId);
      if (!doc) return true; // If no date, include

      const updated = doc.updated_at || doc.created_at || 0;
      const start = filters.dateRangeStart || 0;
      const end = filters.dateRangeEnd || Date.now() + 86400000; // +1 day for inclusive end

      return updated >= start && updated <= end;
    });
  }

  // Apply sorting
  if (filters.sortBy && filters.sortBy !== 'score') {
    results.sort((a, b) => {
      const docA = documents.find((d) => d.id === a.docId);
      const docB = documents.find((d) => d.id === b.docId);
      if (!docA || !docB) return 0;

      let compareVal = 0;
      switch (filters.sortBy) {
        case 'date_modified':
          compareVal = (docA.updated_at || 0) - (docB.updated_at || 0);
          break;
        case 'date_created':
          compareVal = (docA.created_at || 0) - (docB.created_at || 0);
          break;
        case 'title':
          compareVal = docA.title.localeCompare(docB.title);
          break;
      }

      return filters.sortOrder === 'asc' ? compareVal : -compareVal;
    });
  }

  return results;
}
