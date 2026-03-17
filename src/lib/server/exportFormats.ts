/**
 * Export format generators — EPUB and DOCX (pure-JS, no native deps)
 */

// ── EPUB ─────────────────────────────────────────────────────────────────────
// Minimal EPUB 3 structure as a ZIP-like byte array using JSZip-compatible logic.
// We produce a valid EPUB 3 with: mimetype, container.xml, content.opf, nav.xhtml, content.xhtml

export function buildEpubBytes(title: string, content: string, author = 'Unknown'): Uint8Array {
	// Convert markdown-ish content to XHTML
	const bodyHtml = markdownToHtml(content);
	const id = 'sive-doc-' + Date.now();

	const files: Record<string, string> = {
		mimetype: 'application/epub+zip',
		'META-INF/container.xml': `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="EPUB/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
		'EPUB/content.opf': `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">${id}</dc:identifier>
    <dc:title>${escXml(title)}</dc:title>
    <dc:creator>${escXml(author)}</dc:creator>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().slice(0, 19)}Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="content"/>
  </spine>
</package>`,
		'EPUB/nav.xhtml': `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>${escXml(title)}</title></head>
<body>
  <nav epub:type="toc"><h1>Contents</h1>
    <ol><li><a href="content.xhtml">${escXml(title)}</a></li></ol>
  </nav>
</body>
</html>`,
		'EPUB/content.xhtml': `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escXml(title)}</title></head>
<body>
<h1>${escXml(title)}</h1>
${bodyHtml}
</body>
</html>`
	};

	return buildZip(files);
}

// ── DOCX ─────────────────────────────────────────────────────────────────────
// Minimal DOCX (Office Open XML) — word/document.xml inside a ZIP

export function buildDocxBytes(title: string, content: string): Uint8Array {
	const paragraphs = content.split(/\n\n+/).map((para) => {
		const text = para.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] ?? c));
		return `<w:p><w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
	});

	const files: Record<string, string> = {
		'[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
		'_rels/.rels': `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
		'word/document.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>${escXml(title)}</w:t></w:r></w:p>
    ${paragraphs.join('\n    ')}
  </w:body>
</w:document>`,
		'word/_rels/document.xml.rels': `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`,
	};

	return buildZip(files);
}

// ── Minimal ZIP builder ───────────────────────────────────────────────────────
// Produces a valid ZIP (stored, no compression) for EPUB/DOCX containers.

function buildZip(files: Record<string, string>): Uint8Array {
	const enc = new TextEncoder();
	const entries: { name: Uint8Array; data: Uint8Array; offset: number }[] = [];
	const parts: Uint8Array[] = [];
	let offset = 0;

	for (const [name, content] of Object.entries(files)) {
		const nameBytes = enc.encode(name);
		const dataBytes = enc.encode(content);
		const crc = crc32(dataBytes);

		// Local file header
		const lh = localFileHeader(nameBytes, dataBytes.length, crc);
		entries.push({ name: nameBytes, data: dataBytes, offset });
		parts.push(lh, dataBytes);
		offset += lh.length + dataBytes.length;
	}

	// Central directory
	const cdParts: Uint8Array[] = [];
	let cdSize = 0;
	const cdOffset = offset;
	for (const entry of entries) {
		const cd = centralDirEntry(entry.name, entry.data.length, crc32(entry.data), entry.offset);
		cdParts.push(cd);
		cdSize += cd.length;
	}

	const eocd = endOfCentralDir(entries.length, cdSize, cdOffset);
	const all = [...parts, ...cdParts, eocd];
	const total = all.reduce((s, a) => s + a.length, 0);
	const out = new Uint8Array(total);
	let pos = 0;
	for (const p of all) { out.set(p, pos); pos += p.length; }
	return out;
}

function localFileHeader(name: Uint8Array, size: number, crc: number): Uint8Array {
	const buf = new DataView(new ArrayBuffer(30 + name.length));
	buf.setUint32(0, 0x04034b50, true); // signature
	buf.setUint16(4, 20, true); // version
	buf.setUint16(6, 0, true);  // flags
	buf.setUint16(8, 0, true);  // compression (stored)
	buf.setUint16(10, 0, true); buf.setUint16(12, 0, true); // mod time/date
	buf.setUint32(14, crc, true);
	buf.setUint32(18, size, true); buf.setUint32(22, size, true);
	buf.setUint16(26, name.length, true);
	buf.setUint16(28, 0, true);
	new Uint8Array(buf.buffer).set(name, 30);
	return new Uint8Array(buf.buffer);
}

function centralDirEntry(name: Uint8Array, size: number, crc: number, offset: number): Uint8Array {
	const buf = new DataView(new ArrayBuffer(46 + name.length));
	buf.setUint32(0, 0x02014b50, true);
	buf.setUint16(4, 20, true); buf.setUint16(6, 20, true);
	buf.setUint16(8, 0, true); buf.setUint16(10, 0, true);
	buf.setUint16(12, 0, true); buf.setUint16(14, 0, true);
	buf.setUint32(16, crc, true);
	buf.setUint32(20, size, true); buf.setUint32(24, size, true);
	buf.setUint16(28, name.length, true);
	buf.setUint16(30, 0, true); buf.setUint16(32, 0, true);
	buf.setUint16(34, 0, true); buf.setUint16(36, 0, true);
	buf.setUint32(38, 0, true);
	buf.setUint32(42, offset, true);
	new Uint8Array(buf.buffer).set(name, 46);
	return new Uint8Array(buf.buffer);
}

function endOfCentralDir(count: number, size: number, offset: number): Uint8Array {
	const buf = new DataView(new ArrayBuffer(22));
	buf.setUint32(0, 0x06054b50, true);
	buf.setUint16(4, 0, true); buf.setUint16(6, 0, true);
	buf.setUint16(8, count, true); buf.setUint16(10, count, true);
	buf.setUint32(12, size, true); buf.setUint32(16, offset, true);
	buf.setUint16(20, 0, true);
	return new Uint8Array(buf.buffer);
}

function crc32(data: Uint8Array): number {
	let crc = 0xffffffff;
	for (const byte of data) {
		crc ^= byte;
		for (let k = 0; k < 8; k++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
	}
	return (crc ^ 0xffffffff) >>> 0;
}

function escXml(s: string) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function markdownToHtml(md: string): string {
	return md
		.split(/\n\n+/)
		.map((p) => {
			if (p.startsWith('# ')) return `<h1>${escXml(p.slice(2))}</h1>`;
			if (p.startsWith('## ')) return `<h2>${escXml(p.slice(3))}</h2>`;
			if (p.startsWith('### ')) return `<h3>${escXml(p.slice(4))}</h3>`;
			return `<p>${escXml(p)}</p>`;
		})
		.join('\n');
}
