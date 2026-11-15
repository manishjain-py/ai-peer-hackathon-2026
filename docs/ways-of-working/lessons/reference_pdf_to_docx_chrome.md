---
name: reference_pdf_to_docx_chrome
description: "Chrome-printed PDFs to Word: pdf2docx silently drops heading spaces and writes junk \"Type3\" font names; the two fixes and the check that catches it"
metadata:
  type: reference
---

Chrome/Skia prints the macOS system font (SF) as many small Type3 fonts. `pdf2docx` (pip, with
PyMuPDF 1.28) then (1) drops every whitespace-only span (`pdf2docx/text/Spans.py:20`,
`not span.text.strip()`), so titles and headings lose their spaces ("Readingamapof India"), and
(2) names those runs "Type3 (15 0 R)" with no bold, so Word falls back to a serif. Body text in a
real embedded font (Georgia) converts perfectly, which hides the defect at a glance.

Fixes used 2026-09-11 (Manish's draft PDFs O/F/G → O.docx/F.docx/G.docx, sent on Telegram): patch
`Spans.restore` to drop only empty spans; map each Type3 xref → its FontDescriptor `FontName`
(weight = `wght<hex>` >> 16, or "Bold" = 700) → Arial, bold if ≥ 600. Checks: PyMuPDF word
sequence == python-docx word sequence == `textutil -convert txt` word sequence; Arial line widths
via PyMuPDF `helv`/`hebo` metrics (Arial is metric-compatible with Helvetica) against each
paragraph's available width. Not carried: lone drawn rules. The Mac used that day had no Word or
LibreOffice; `qlmanage -t` previews page 1 only and draws a section break as "□" (harmless).

**How to apply:** on any PDF→Word request, diff the words before sending; if the PDF came from
Chrome, apply both fixes.
