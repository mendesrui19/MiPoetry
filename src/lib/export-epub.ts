import JSZip from "jszip";
import { bodyToPlainText } from "@/lib/rich-text";
import type { Book, Poem, User } from "@/lib/types";

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function poemXhtml(poem: Poem, index: number) {
  const title = escapeXml(poem.title?.trim() || `Poema ${index + 1}`);
  const body = escapeXml(bodyToPlainText(poem.body))
    .split("\n")
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt">
<head><title>${title}</title></head>
<body>
  <h1>${title}</h1>
  ${body || "<p></p>"}
</body>
</html>`;
}

export async function downloadBookEpub(book: Book, author: User, poems: Poem[]) {
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  const container = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.folder("META-INF")?.file("container.xml", container);

  const title = escapeXml(book.title);
  const authorName = escapeXml(author.displayName);
  const desc = escapeXml(book.description || "Antologia MiPoetry");

  const manifestItems = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="titlepage" href="title.xhtml" media-type="application/xhtml+xml"/>`,
  ];
  const spineItems = [`<itemref idref="titlepage"/>`];

  poems.forEach((poem, i) => {
    const id = `poem-${i + 1}`;
    manifestItems.push(
      `<item id="${id}" href="${id}.xhtml" media-type="application/xhtml+xml"/>`
    );
    spineItems.push(`<itemref idref="${id}"/>`);
    zip.folder("OEBPS")?.file(`${id}.xhtml`, poemXhtml(poem, i));
  });

  const navLinks = poems
    .map(
      (p, i) =>
        `<li><a href="poem-${i + 1}.xhtml">${escapeXml(p.title?.trim() || `Poema ${i + 1}`)}</a></li>`
    )
    .join("\n");

  const nav = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt">
<head><title>Índice</title></head>
<body>
  <nav epub:type="toc"><ol>${navLinks}</ol></nav>
</body>
</html>`;

  const titlePage = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt">
<head><title>${title}</title></head>
<body>
  <h1>${title}</h1>
  <p>${desc}</p>
  <p><em>${authorName}</em></p>
</body>
</html>`;

  zip.folder("OEBPS")?.file("nav.xhtml", nav);
  zip.folder("OEBPS")?.file("title.xhtml", titlePage);

  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">${escapeXml(book.id)}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:creator>${authorName}</dc:creator>
    <dc:language>pt</dc:language>
  </metadata>
  <manifest>
    ${manifestItems.join("\n    ")}
  </manifest>
  <spine>
    ${spineItems.join("\n    ")}
  </spine>
</package>`;

  zip.folder("OEBPS")?.file("content.opf", opf);

  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${book.slug || "antologia"}.epub`;
  a.click();
  URL.revokeObjectURL(url);
}
