const W = 1080;
const H = 1350;
const INK = "#141210";
const PAPER = "#f3ead6";
const BRASS = "#b8954a";
const FEATHER = "#8e3a32";

async function loadFonts() {
  const faces = [
    new FontFace(
      "Cormorant Garamond",
      "url(/fonts/cormorant-garamond-latin-italic.woff2)",
      { style: "italic", weight: "400" },
    ),
    new FontFace("Outfit", "url(/fonts/outfit-latin.woff2)", {
      style: "normal",
      weight: "500",
    }),
  ];
  for (const face of faces) {
    try {
      const ready = await face.load();
      document.fonts.add(ready);
    } catch {
      /* already registered, or offline */
    }
  }
  try {
    await document.fonts.ready;
  } catch {
    /* ignore */
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    if (lines.length === maxLines - 1) break;
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) {
      last = last.slice(0, -1).trimEnd();
    }
    lines[maxLines - 1] = `${last}…`;
  }
  return lines;
}

function quoted(text: string) {
  const t = text.trim();
  if (!t) return t;
  if (t.startsWith("“") || t.startsWith('"') || t.startsWith("‘")) return t;
  return `“${t}”`;
}

export async function renderPassageCard(opts: {
  imageUrl: string;
  kicker: string;
  quote: string;
  listen?: string | null;
}): Promise<Blob> {
  await loadFonts();
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("plate"));
    el.src = opts.imageUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);

  const cropH = 720;
  const scale = Math.max(W / img.width, cropH / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (W - dw) / 2, (cropH - dh) / 2, dw, dh);
  ctx.fillStyle = INK;
  ctx.fillRect(0, cropH, W, H - cropH);

  ctx.fillStyle = BRASS;
  ctx.font = "500 28px Outfit, ui-sans-serif, sans-serif";
  ctx.fillText(opts.kicker.toUpperCase(), 72, cropH + 72);

  ctx.fillStyle = PAPER;
  ctx.font = 'italic 52px "Cormorant Garamond", "Times New Roman", serif';
  const lines = wrap(ctx, quoted(opts.quote), W - 144, 6);
  lines.forEach((line, i) => {
    ctx.fillText(line, 72, cropH + 150 + i * 64);
  });

  if (opts.listen) {
    ctx.fillStyle = FEATHER;
    ctx.font = "500 24px Outfit, ui-sans-serif, sans-serif";
    ctx.fillText(opts.listen.toUpperCase(), 72, H - 72);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("blob"))), "image/jpeg", 0.82);
  });
}
