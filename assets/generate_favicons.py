"""
Renderiza los PNG del favicon de Monitor Laboral a partir del mismo
diseño del SVG (gauge semicircular de 3 niveles + aguja + pivote).

Salidas (junto a favicon.svg en assets/):
  - favicon-16x16.png
  - favicon-32x32.png
  - apple-touch-icon.png  (180x180)

La paleta coincide con css/styles.css:
  --azul-oscuro: #0e3a5d
  --azul:        #2f6f9f
  --verde:       #2e7d52
  --ambar:       #c98a1b
"""

from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw


# Paleta institucional (sincronizada con css/styles.css)
COLOR_BG       = (14, 58, 93)    # #0e3a5d  --azul-oscuro
COLOR_TRACK    = (29, 79, 122)   # #1d4f7a  variante más clara (track)
COLOR_VERDE    = (46, 125, 82)   # #2e7d52
COLOR_AMBAR    = (201, 138, 27)  # #c98a1b
COLOR_NEEDLE   = (255, 255, 255) # #ffffff


def _draw_favicon(size: int) -> Image.Image:
    """Dibuja el favicon a `size x size` píxeles."""
    # Super-sample 8x para que los bordes del arco y la aguja
    # queden suaves; luego reducimos con LANCZOS.
    ss = 8
    s = size * ss
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # --- 1) Fondo: cuadrado redondeado ---
    radius = int(round(14 * s / 64))     # mismo radio que el SVG (rx=14)
    d.rounded_rectangle((0, 0, s - 1, s - 1), radius=radius, fill=COLOR_BG)

    # Geometría del gauge (idéntica al SVG, escalada a `s`):
    #   centro (cx, cy) = (32, 42) en 64 → (cx, cy) = (0.5*s, 0.65625*s)
    #   radio r = 20 en 64 → r = 0.3125 * s
    cx, cy = s * 0.5, s * 0.65625
    r  = s * 0.3125
    sw = s * 7 / 64                       # grosor del arco (=7 en SVG)

    # --- 2) Pista completa (track) ---
    # bbox del arco: (cx-r, cy-r) → (cx+r, cy+r), solo el medio superior
    arc_box = (cx - r, cy - r, cx + r, cy + r)
    d.arc(arc_box, start=180, end=360, fill=COLOR_TRACK, width=int(round(sw)))

    # Endpoints de los segmentos coloreados (en coords de pantalla `s`):
    # 60° desde el inicio (verde)
    import math
    def pt(deg_from_start: float) -> tuple[float, float]:
        # 0° = izquierda (180° en coords estándar), crece en sentido horario
        ang = math.radians(180 - deg_from_start)
        return (cx + r * math.cos(ang), cy - r * math.sin(ang))

    p0   = pt(0)        # extremo izquierdo (12, 42 en SVG)
    p33  = pt(60)       # fin del segmento verde
    p66  = pt(120)      # fin del segmento ámbar

    # --- 3) Segmento verde (0-33% del arco) ---
    d.line([p0, p33], fill=COLOR_VERDE, width=int(round(sw)))
    # Tapa redondeada en los extremos del segmento
    for px, py in (p0, p33):
        d.ellipse(
            (px - sw / 2, py - sw / 2, px + sw / 2, py + sw / 2),
            fill=COLOR_VERDE,
        )

    # --- 4) Segmento ámbar (33-66% del arco, rango "elevado") ---
    # Lo aproximamos con una polilínea de 24 muestras para que se vea curvo
    samples = 24
    last = p33
    for i in range(1, samples + 1):
        cur = pt(60 + (66 - 60) * i / samples)
        d.line([last, cur], fill=COLOR_AMBAR, width=int(round(sw)))
        last = cur
    # Tapa redondeada al final del segmento ámbar
    d.ellipse(
        (p66[0] - sw / 2, p66[1] - sw / 2, p66[0] + sw / 2, p66[1] + sw / 2),
        fill=COLOR_AMBAR,
    )

    # --- 5) Aguja (~60% del arco, hacia el rango "elevado") ---
    needle_end = pt(60)
    needle_w = max(2, int(round(s * 3 / 64)))
    d.line([(cx, cy), needle_end], fill=COLOR_NEEDLE, width=needle_w)

    # --- 6) Pivote central ---
    pivot_r = s * 3.5 / 64
    d.ellipse(
        (cx - pivot_r, cy - pivot_r, cx + pivot_r, cy + pivot_r),
        fill=COLOR_NEEDLE,
    )

    # Downsample con LANCZOS para que las curvas se vean nítidas
    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    here = Path(__file__).resolve().parent
    sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "apple-touch-icon.png": 180,
    }
    for name, size in sizes.items():
        out = _draw_favicon(size)
        path = here / name
        out.save(path, format="PNG", optimize=True)
        print(f"  · {name:24s} {size}x{size}  ({path.stat().st_size} B)")


if __name__ == "__main__":
    main()
