import { describe, it, expect } from 'vitest';
import { search, indexDocument, searchWithFilters } from './search';

describe('search engine', () => {
  const sampleDocs = [
    {
      id: 'doc1',
      title: 'The Great Gatsby',
      content: 'In my younger and more vulnerable years my father gave me advice about the East Coast.'
    },
    {
      id: 'doc2',
      title: 'To Kill a Mockingbird',
      content:
        'When he was nearly thirteen, my brother Jem and I were to be introduced to some medical science.'
    },
    {
      id: 'doc3',
      title: 'Pride and Prejudice',
      content: 'It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.'
    }
  ];

  describe('indexDocument', () => {
    it('should index document with title and content', () => {
      const doc = sampleDocs[0];
      const indexed = indexDocument(doc);

      expect(indexed.id).toBe(doc.id);
      expect(indexed.titleLower).toBe(doc.title.toLowerCase());
      expect(indexed.contentLower).toBe(doc.content.toLowerCase());
    });

    it('should preserve original title and content', () => {
      const doc = sampleDocs[0];
      const indexed = indexDocument(doc);

      expect(indexed.originalTitle).toBe(doc.title);
      expect(indexed.originalContent).toBe(doc.content);
    });
  });

  describe('basic search', () => {
    it('should find document by title', () => {
      const indexed = sampleDocs.map(indexDocument);
      const results = search('Gatsby', indexed);

      expect(results.length).toBe(1);
      expect(results[0].docId).toBe('doc1');
      expect(results[0].title).toBe('The Great Gatsby');
    });

    it('should find document by content', () => {
      const indexed = sampleDocs.map(indexDocument);
      const results = search('vulnerable', indexed);

      expect(results.length).toBe(1);
      expect(results[0].docId).toBe('doc1');
    });

    it('should be case-insensitive', () => {
      const indexed = sampleDocs.map(indexDocument);
      const resultsLower = search('gatsby', indexed);
      const resultsUpper = search('GATSBY', indexed);
      const resultsMixed = search('gAtBy', indexed);

      expect(resultsLower.length).toBe(1);
      expect(resultsUpper.length).toBe(1);
      expect(resultsMixed.length).toBe(1);
    });

    it('should return empty results for non-matching query', () => {
      const indexed = sampleDocs.map(indexDocument);
      const results = search('nonexistent', indexed);

      expect(results.length).toBe(0);
    });

    it('should return empty results for empty query', () => {
      const indexed = sampleDocs.map(indexDocument);
      const results = search('', indexed);

      expect(results.length).toBe(0);
    });
  });

  describe('result ranking', () => {
    it('should rank title matches higher than content matches', () => {
      const docs = [
        { id: 'doc1', title: 'Search', content: 'This is about something else' },
        { id: 'doc2', title: 'Unrelated', content: 'This mentions search in the content area' }
      ];
      const indexed = docs.map(indexDocument);
      const results = search('search', indexed);

      expect(results[0].docId).toBe('doc1'); // Title match should rank first
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });

    it('should score multiple matches higher', () => {
      const docs = [
        { id: 'doc1', title: 'Query', content: 'Query about queries and query results' },
        { id: 'doc2', title: 'Test', content: 'Single query mention only' }
      ];
      const indexed = docs.map(indexDocument);
      const results = search('query', indexed);

      expect(results[0].docId).toBe('doc1');
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });

    it('should score early matches higher', () => {
      const docs = [
        { id: 'doc1', title: 'Test', content: 'Match at the very start of content' },
        { id: 'doc2', title: 'Test', content: 'Some text before the match appears later in content' }
      ];
      const indexed = docs.map(indexDocument);
      const results = search('match', indexed);

      expect(results[0].docId).toBe('doc1');
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });
  });

  describe('phrase search', () => {
    it('should find exact phrase with quotes', () => {
      const docs = [
        {
          id: 'doc1',
          title: 'Test',
          content: 'A quick brown fox jumps over the lazy dog'
        },
        {
          id: 'doc2',
          title: 'Test',
          content: 'The brown fox is quick and nimble'
        }
      ];
      const indexed = docs.map(indexDocument);
      const results = search('"quick brown"', indexed);

      expect(results.length).toBe(1);
      expect(results[0].docId).toBe('doc1');
    });

    it('should not match out-of-order phrase words', () => {
      const docs = [
        {
          id: 'doc1',
          title: 'Test',
          content: 'The brown quick fox'
        }
      ];
      const indexed = docs.map(indexDocument);
      const results = search('"quick brown"', indexed);

      expect(results.length).toBe(0);
    });

    it('should score phrase matches higher than substring matches', () => {
      const docs = [
        {
          id: 'doc1',
          title: 'Test',
          content: 'exact phrase match is great'
        },
        {
          id: 'doc2',
          title: 'Test',
          content: 'phrase and more phrase and exact'
        }
      ];
      const indexed = docs.map(indexDocument);
      const results = search('"exact phrase"', indexed);

      expect(results[0].docId).toBe('doc1');
    });
  });

  describe('snippet extraction', () => {
    it('should extract snippet around match', () => {
      const doc = {
        id: 'doc1',
        title: 'Test',
        content:
          'The quick brown fox jumps over the lazy dog. The dog was very lazy indeed.'
      };
      const indexed = indexDocument(doc);
      const results = search('lazy', [indexed]);

      expect(results[0].snippet).toContain('lazy');
      expect(results[0].snippet.length).toBeLessThanOrEqual(160); // ~150 + ellipsis
    });

    it('should highlight matches in snippet', () => {
      const doc = {
        id: 'doc1',
        title: 'Test',
        content: 'The quick brown fox jumps over the lazy dog'
      };
      const indexed = indexDocument(doc);
      const results = search('brown', [indexed]);

      expect(results[0].highlights.length).toBeGreaterThan(0);
      expect(results[0].highlights[0].start).toBeLessThan(results[0].highlights[0].end);
    });

    it('should add ellipsis for truncated content', () => {
      const doc = {
        id: 'doc1',
        title: 'Test',
        content:
          'A' +
          'a'.repeat(100) +
          'match' +
          'b'.repeat(100)
      };
      const indexed = indexDocument(doc);
      const results = search('match', [indexed]);

      expect(results[0].snippet).toContain('...');
    });
  });

  describe('searchWithFilters', () => {
    const docsWithMetadata = [
      {
        id: 'doc1',
        title: 'Summer Vacation',
        content: 'We had a great time at the beach',
        tags: ['travel', 'summer'],
        updated_at: new Date('2026-01-15').getTime(),
        created_at: new Date('2026-01-01').getTime()
      },
      {
        id: 'doc2',
        title: 'Winter Sports',
        content: 'Skiing and snowboarding are fun winter activities',
        tags: ['sports', 'winter'],
        updated_at: new Date('2026-02-15').getTime(),
        created_at: new Date('2026-02-01').getTime()
      },
      {
        id: 'doc3',
        title: 'Beach Travel Guide',
        content: 'Everything you need to know about beach vacations',
        tags: ['travel', 'beach'],
        updated_at: new Date('2026-03-01').getTime(),
        created_at: new Date('2026-02-20').getTime()
      }
    ];

    it('should filter by single tag', () => {
      const results = searchWithFilters('travel', docsWithMetadata, {
        tags: ['travel']
      });

      expect(results.length).toBe(2);
      expect(results.map((r) => r.docId)).toContain('doc1');
      expect(results.map((r) => r.docId)).toContain('doc3');
    });

    it('should filter by multiple tags (AND logic)', () => {
      const results = searchWithFilters('travel', docsWithMetadata, {
        tags: ['travel', 'summer']
      });

      expect(results.length).toBe(1);
      expect(results[0].docId).toBe('doc1');
    });

    it('should filter by date range', () => {
      const start = new Date('2026-02-01').getTime();
      const end = new Date('2026-02-28').getTime();

      const results = searchWithFilters('sports', docsWithMetadata, {
        dateRangeStart: start,
        dateRangeEnd: end
      });

      expect(results.length).toBe(1);
      expect(results[0].docId).toBe('doc2');
    });

    it('should sort by date (descending)', () => {
      const results = searchWithFilters('travel', docsWithMetadata, {
        sortBy: 'date_modified',
        sortOrder: 'desc'
      });

      expect(results[0].docId).toBe('doc3'); // Most recent
      expect(results[1].docId).toBe('doc1'); // Second
    });

    it('should sort by title (ascending)', () => {
      const results = searchWithFilters('', docsWithMetadata, {
        sortBy: 'title',
        sortOrder: 'asc'
      });

      expect(results[0].title).toBe('Beach Travel Guide');
      expect(results[1].title).toBe('Summer Vacation');
      expect(results[2].title).toBe('Winter Sports');
    });

    it('should combine search, filter, and sort', () => {
      const results = searchWithFilters('travel', docsWithMetadata, {
        tags: ['travel'],
        sortBy: 'title',
        sortOrder: 'asc'
      });

      expect(results.length).toBe(2);
      expect(results[0].title).toBe('Beach Travel Guide');
      expect(results[1].title).toBe('Summer Vacation');
    });
  });

  describe('performance', () => {
    it('should search 100 documents in reasonable time', () => {
      const docs = Array.from({ length: 100 }, (_, i) => ({
        id: `doc${i}`,
        title: `Document ${i}`,
        content: `This is the content of document number ${i} with some searchable text`
      }));

      const indexed = docs.map(indexDocument);
      const start = performance.now();
      const results = search('document', indexed);
      const elapsed = performance.now() - start;

      expect(results.length).toBeGreaterThan(0);
      expect(elapsed).toBeLessThan(200); // <200ms
    });
  });

  describe('edge cases', () => {
    it('should handle empty document list', () => {
      const results = search('test', []);
      expect(results.length).toBe(0);
    });

    it('should handle documents with empty content', () => {
      const indexed = indexDocument({
        id: 'doc1',
        title: 'Title Only',
        content: ''
      });
      const results = search('Title', [indexed]);

      expect(results.length).toBe(1);
    });

    it('should handle special characters in search query', () => {
      const doc = {
        id: 'doc1',
        title: 'Test (parentheses) & special',
        content: 'Content with regex chars: . * + ?'
      };
      const indexed = indexDocument(doc);

      // Should not throw, should handle regex escaping
      const results = search('(parentheses)', [indexed]);
      expect(results.length).toBe(1);
    });

    it('should handle very long documents', () => {
      const doc = {
        id: 'doc1',
        title: 'Long Document',
        content: 'word '.repeat(20000) + 'searchterm ' + 'word '.repeat(20000)
      };
      const indexed = indexDocument(doc);
      const results = search('searchterm', [indexed]);

      expect(results.length).toBe(1);
      expect(results[0].snippet).toContain('searchterm');
    });
  });
});
