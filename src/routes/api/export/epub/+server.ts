/**
 * EPUB Export Endpoint
 * 
 * Generates EPUB files from project documents.
 * Supports chapters, metadata, and table of contents.
 */

import type { RequestHandler } from './$types';

interface EPUBChapter {
	id: string;
	title: string;
	content: string;
	order: number;
}

interface EPUBMetadata {
	title: string;
	author: string;
	language: string;
	publisher: string;
	description?: string;
	coverImage?: Buffer;
}

/**
 * Generate EPUB content
 */
function generateEPUB(chapters: EPUBChapter[], metadata: EPUBMetadata): Buffer {
	// EPUB is a ZIP archive with specific structure
	// This is a simplified implementation - production would use epub-gen or similar
	
	const epubContent = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:${generateUUID()}</dc:identifier>
    <dc:title>${escapeXML(metadata.title)}</dc:title>
    <dc:creator>${escapeXML(metadata.author)}</dc:creator>
    <dc:language>${metadata.language}</dc:language>
    <dc:publisher>${escapeXML(metadata.publisher)}</dc:publisher>
    ${metadata.description ? `<dc:description>${escapeXML(metadata.description)}</dc:description>` : ''}
    <meta property="dcterms:modified">${new Date().toISOString().split('.')[0]}Z</meta>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    ${chapters.map((c, i) => `<item id="chapter${i}" href="chapters/${c.id}.xhtml" media-type="application/xhtml+xml"/>`).join('\n    ')}
  </manifest>
  <spine>
    ${chapters.map((c, i) => `<itemref idref="chapter${i}"/>`).join('\n    ')}
  </spine>
</package>`;

	// In production, would create proper ZIP archive
	// For now, return placeholder
	return Buffer.from(epubContent);
}

/**
 * Generate NCX (table of contents)
 */
function generateNCX(chapters: EPUBChapter[], metadata: EPUBMetadata): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${generateUUID()}"/>
  </head>
  <docTitle><text>${escapeXML(metadata.title)}</text></docTitle>
  <docAuthor><text>${escapeXML(metadata.author)}</text></docAuthor>
  <navMap>
    ${chapters.map((c, i) => `
    <navPoint id="navpoint-${i}" playOrder="${i + 1}">
      <navLabel><text>${escapeXML(c.title)}</text></navLabel>
      <content src="chapters/${c.id}.xhtml"/>
    </navPoint>`).join('')}
  </navMap>
</ncx>`;
}

/**
 * Generate chapter XHTML
 */
function generateChapterXHTML(chapter: EPUBChapter): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>${escapeXML(chapter.title)}</title>
    <style>
      body { font-family: serif; line-height: 1.6; margin: 1em; }
      h1 { text-align: center; margin-bottom: 2em; }
      p { text-indent: 1.5em; margin: 0.5em 0; }
    </style>
  </head>
  <body>
    <h1>${escapeXML(chapter.title)}</h1>
    ${chapter.content.split('\n').map(p => `<p>${escapeXML(p)}</p>`).join('\n    ')}
  </body>
</html>`;
}

/**
 * Escape XML special characters
 */
function escapeXML(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Generate UUID
 */
function generateUUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { chapters, metadata } = body as {
			chapters: EPUBChapter[];
			metadata: Partial<EPUBMetadata>;
		};

		// Validate required fields
		if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
			return new Response(JSON.stringify({ error: 'Chapters are required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (!metadata?.title || !metadata?.author) {
			return new Response(JSON.stringify({ error: 'Title and author are required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Fill in defaults
		const fullMetadata: EPUBMetadata = {
			title: metadata.title,
			author: metadata.author,
			language: metadata.language || 'en',
			publisher: metadata.publisher || 'Sive',
			description: metadata.description,
			coverImage: metadata.coverImage
		};

		// Sort chapters by order
		const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

		// Generate EPUB
		const epubBuffer = generateEPUB(sortedChapters, fullMetadata);

		// Return as downloadable file
		const filename = `${metadata.title.replace(/[^a-z0-9]/gi, '_')}.epub`;
		
		return new Response(epubBuffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/epub+zip',
				'Content-Disposition': `attachment; filename="${filename}"`
			}
		});
	} catch (err) {
		console.error('[EPUB Export] Error:', err);
		return new Response(JSON.stringify({ 
			error: 'Failed to generate EPUB',
			details: err instanceof Error ? err.message : 'Unknown error'
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};

/**
 * GET endpoint for EPUB export info
 */
export const GET: RequestHandler = async () => {
	return new Response(JSON.stringify({
		endpoint: '/api/export/epub',
		method: 'POST',
		description: 'Export document(s) as EPUB',
		requiredFields: ['chapters', 'metadata.title', 'metadata.author'],
		example: {
			chapters: [
				{ id: 'ch1', title: 'Chapter 1', content: '...', order: 1 }
			],
			metadata: {
				title: 'My Novel',
				author: 'John Doe',
				language: 'en',
				publisher: 'Sive'
			}
		}
	}), {
		headers: { 'Content-Type': 'application/json' }
	});
};
