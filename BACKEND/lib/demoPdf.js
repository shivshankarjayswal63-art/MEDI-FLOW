/** Minimal valid PDF for demo lab reports (works in browser PDF viewer). */
function escapePdfText(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildDemoPdf(title = "MEDI FLOW Lab Report") {
  const line1 = escapePdfText(title);
  const line2 = escapePdfText("Demo data - MEDI FLOW Health Portal");
  const stream = `BT /F1 16 Tf 50 750 Td (${line1}) Tj 0 -28 Td (${line2}) Tj ET`;
  const streamLen = Buffer.byteLength(stream, "utf8");

  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 =
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";
  const obj4 = `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj\n`;
  const obj5 = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";

  const header = "%PDF-1.4\n";
  const objects = [obj1, obj2, obj3, obj4, obj5];
  let body = header;
  const offsets = [0];
  for (const o of objects) {
    offsets.push(Buffer.byteLength(body, "utf8"));
    body += o;
  }

  const xrefStart = Buffer.byteLength(body, "utf8");
  let xref = "xref\n0 6\n0000000000 65535 f \n";
  for (let i = 1; i <= 5; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(body + xref + trailer, "utf8");
}

module.exports = { buildDemoPdf };
