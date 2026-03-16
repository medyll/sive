import type { RequestHandler } from './$types';

// Mock PDF stub (base64-encoded minimal PDF for dev)
// In production, this would be generated server-side via a headless renderer
const STUB_PDF_BASE64 =
	'JVBERi0xLjANCjEgMCBvYmo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PmVuZG9iag' +
	'oyIDAgb2JqPDwvVHlwZS9QYWdlcy9LaWRzWzMgMCBSXS9Db3VudCAxPj5lbmRvYmoKMyAw' +
	'IG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL0' +
	'Jlc291cmNlcyA0IDAgUi9Db250ZW50cyA1IDAgUj4+ZW5kb2JqCjQgMCBvYmo8PC9Gb250' +
	'PDwvRjE8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+Pg' +
	'o+Pj4+ZW5kb2JqCjUgMCBvYmo8PC9MZW5ndGggNDQvL0ZpbHRlci9GbGF0ZURlY29kZT4+' +
	'c3RyZWFtCngHKywoKSgqJSgrLysqMwplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDA' +
	'wMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4g' +
	'CjAwMDAwMDAxMzUgMDAwMDAgbiAKMDAwMDAwMDIyNiAwMDAwMCBuIAowMDAwMDAwMzI2IDAw' +
	'MDAwIG4gCnRyYWlsZXI8PC9TaXplIDYvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgo0NzMKJSV' +
	'FT0YK';

export const GET: RequestHandler = async ({ url }) => {
	const docId = url.searchParams.get('docId') ?? '';
	const includeSummary = url.searchParams.get('includeSummary') === 'true';

	// In dev/stub mode, return the mock PDF
	// Real implementation would render HTML to PDF using a library like:
	// - html2pdf.js (client-side, but can be ported to server)
	// - puppeteer (headless Chrome rendering)
	// - wkhtmltopdf (system command)

	const pdfData = Buffer.from(STUB_PDF_BASE64, 'base64');

	return new Response(pdfData, {
		status: 200,
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename="${sanitizeFilename(docId || 'document')}.pdf"`,
			'Cache-Control': 'no-cache'
		}
	});
};

function sanitizeFilename(name: string): string {
	return (name || 'document').replace(/[^a-z0-9_\-]/gi, '_').slice(0, 100);
}
