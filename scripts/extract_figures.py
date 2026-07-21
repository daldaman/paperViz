"""Extract figures from a paper PDF into public/papers/<slug>/.

Semi-manual workflow (run with the anaconda python that has PyMuPDF):

    C:/Users/david/anaconda3/python.exe scripts/extract_figures.py <pdf> <slug> [--page N]

Two modes:
  1. --page N with exactly one embedded raster image on the page: extracts the
     image XObject at native resolution (best quality — no re-rendering).
  2. --page N --rect x0,y0,x1,y1: renders the page at 3x zoom and crops the
     given rectangle (PDF points). Iterate on the rect by eye; use --probe to
     dump a full-page render first.

Outputs PNG files under public/papers/<slug>/ named on the command line via
--out (default: fig-p<page>.png). Never modifies the source PDF.
"""
import argparse
import pathlib
import sys

import fitz  # PyMuPDF


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("pdf")
    ap.add_argument("slug")
    ap.add_argument("--page", type=int, required=True, help="1-indexed page number")
    ap.add_argument("--rect", help="crop rect 'x0,y0,x1,y1' in PDF points (render mode)")
    ap.add_argument("--probe", action="store_true", help="dump full-page render and image inventory, then exit")
    ap.add_argument("--out", help="output filename (default fig-p<page>.png)")
    args = ap.parse_args()

    doc = fitz.open(args.pdf)
    page = doc[args.page - 1]
    outdir = pathlib.Path(__file__).resolve().parent.parent / "public" / "papers" / args.slug
    outdir.mkdir(parents=True, exist_ok=True)
    out = outdir / (args.out or f"fig-p{args.page}.png")

    if args.probe:
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        probe = outdir / f"_probe-p{args.page}.png"
        pix.save(probe)
        print(f"probe render: {probe}")
        for img in page.get_images(full=True):
            print(f"embedded image: xref={img[0]} {img[2]}x{img[3]}")
        return 0

    if args.rect:
        x0, y0, x1, y1 = (float(v) for v in args.rect.split(","))
        pix = page.get_pixmap(matrix=fitz.Matrix(3, 3), clip=fitz.Rect(x0, y0, x1, y1))
    else:
        imgs = page.get_images(full=True)
        if len(imgs) != 1:
            print(f"page {args.page} has {len(imgs)} embedded images; use --rect or --probe", file=sys.stderr)
            return 1
        pix = fitz.Pixmap(doc, imgs[0][0])
        if pix.colorspace and pix.colorspace.n > 3:
            pix = fitz.Pixmap(fitz.csRGB, pix)

    pix.save(out)
    print(f"saved {out} ({pix.width}x{pix.height})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
