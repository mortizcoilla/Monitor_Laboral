"""
Genera og-image.png (1200x630) y og-image-square.png (1200x1200)
para los previews de LinkedIn, Twitter, WhatsApp, etc.

Paleta sincronizada con css/styles.css.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from math import cos, sin, radians
import os

# Paleta del sitio
AZUL_OSCURO = (14, 58, 93)       # #0e3a5d
AZUL = (47, 111, 159)            # #2f6f9f
AZUL_CLARO = (143, 184, 212)     # #8fb8d4
AZUL_PALIDO = (219, 232, 241)    # #dbe8f1
TINTA = (29, 43, 54)             # #1d2b36
FONDO = (244, 246, 248)
GRIS = (91, 107, 122)

# Niveles del ICML (5 niveles: bajo a crítico)
NIVELES = [
    ((46, 125, 82),   "Bajo"),       # verde
    ((138, 168, 79),  "Moderado"),   # verde-oliva
    ((217, 161, 59),  "Elevado"),    # ámbar
    ((194, 94, 46),   "Alto"),       # naranja
    ((165, 47, 47),   "Crítico"),    # rojo oscuro
]

W, H = 1200, 630

# ----------------------------------------------------------------------------
# Fuente: Inter y Playfair Display del sistema o fallback
# ----------------------------------------------------------------------------
def load_font(name_options, size):
    """Prueba varias rutas de fuente; cae a default si no encuentra nada."""
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf",   # Segoe UI Bold
        r"C:\Windows\Fonts\segoeui.ttf",    # Segoe UI
        r"C:\Windows\Fonts\arialbd.ttf",    # Arial Bold
        r"C:\Windows\Fonts\arial.ttf",      # Arial
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()

# Fuentes más específicas — Playfair para título, Inter para body
def load_serif(size, bold=False):
    cands = [
        r"C:\Windows\Fonts\playfairdisplay-bold.ttf",
        r"C:\Windows\Fonts\playfairdisplay-regular.ttf",
        r"C:\Windows\Fonts\Georgia\Georgia Bold.ttf" if bold else r"C:\Windows\Fonts\georgia.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
    ]
    for p in cands:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return load_font(None, size)

def load_sans(size, bold=False):
    cands = [
        r"C:\Windows\Fonts\inter\Inter-Bold.ttf" if bold else r"C:\Windows\Fonts\inter\Inter-Regular.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ]
    for p in cands:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return load_font(None, size)


# ----------------------------------------------------------------------------
# Fondo: gradiente diagonal azul oscuro
# ----------------------------------------------------------------------------
def make_gradient_bg(width, height, c1, c2, c3):
    img = Image.new("RGB", (width, height), c1)
    px = img.load()
    for y in range(height):
        t = y / max(1, height - 1)
        if t < 0.6:
            r = c1[0] + (c2[0] - c1[0]) * (t / 0.6)
            g = c1[1] + (c2[1] - c1[1]) * (t / 0.6)
            b = c1[2] + (c2[2] - c1[2]) * (t / 0.6)
        else:
            tt = (t - 0.6) / 0.4
            r = c2[0] + (c3[0] - c2[0]) * tt
            g = c2[1] + (c3[1] - c2[1]) * tt
            b = c2[2] + (c3[2] - c2[2]) * tt
        for x in range(width):
            # leve variación horizontal para más profundidad
            xs = x / max(1, width - 1)
            shade = 1.0 - 0.06 * xs
            px[x, y] = (int(r * shade), int(g * shade), int(b * shade))
    return img


# ----------------------------------------------------------------------------
# Gauge semicircular (estilo ICML, 5 niveles)
# ----------------------------------------------------------------------------
def draw_gauge(draw, cx, cy, radius, thickness, valor_relativo=0.55,
               n_niveles=5, label="ICML", valor_texto="56,2",
               sub_texto="Calidad del mercado laboral"):
    """
    cx, cy: centro del gauge
    radius: radio externo
    thickness: grosor del arco
    valor_relativo: 0..1, posición de la aguja
    """
    # 180° = de izquierda (-180°) a derecha (0°), arco por arriba
    start_deg = 180
    end_deg = 360
    span = end_deg - start_deg  # 180°

    # Anillo de fondo (oscuro)
    for i in range(thickness):
        draw.arc(
            (cx - radius + i, cy - radius + i, cx + radius - i, cy + radius - i),
            start=start_deg, end=end_deg,
            fill=(30, 70, 100), width=1
        )

    # Sectores de color: dividir span en n_niveles
    nivel_span = span / n_niveles
    for i, (color, _name) in enumerate(NIVELES[:n_niveles]):
        s = start_deg + i * nivel_span
        e = s + nivel_span
        draw.arc(
            (cx - radius, cy - radius, cx + radius, cy + radius),
            start=s, end=e, fill=color, width=thickness
        )

    # Aguja (corta — solo llega a la mitad del radio, no toca el texto)
    ang = radians(start_deg + valor_relativo * span)
    inner = radius * 0.48
    tip_x = cx + inner * cos(ang)
    tip_y = cy + inner * sin(ang)
    hub_r = 11
    # sombra de la aguja
    draw.line([(cx + 1, cy + 1), (tip_x + 1, tip_y + 1)], fill=(0, 0, 0, 180), width=4)
    draw.line([(cx, cy), (tip_x, tip_y)], fill=(245, 248, 250), width=4)
    # cubo central
    draw.ellipse((cx - hub_r, cy - hub_r, cx + hub_r, cy + hub_r), fill=(245, 248, 250), outline=AZUL_OSCURO, width=3)
    draw.ellipse((cx - 4, cy - 4, cx + 4, cy + 4), fill=AZUL_OSCURO)

    # Etiquetas de los extremos (bajo el arco)
    f_ext = load_sans(17, bold=True)
    draw.text((cx - radius + 5, cy + 20), "0", fill=AZUL_PALIDO, font=f_ext)
    right_text = "100"
    bbox = draw.textbbox((0, 0), right_text, font=f_ext)
    draw.text((cx + radius - bbox[2] - 5, cy + 20), right_text, fill=AZUL_PALIDO, font=f_ext)

    # Sin label interno: el valor y subtexto se bastan solos

    # Valor grande centrado (dibujado DESPUÉS de la aguja para que no se superponga)
    f_val = load_serif(76, bold=True)
    bbox = draw.textbbox((0, 0), valor_texto, font=f_val)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    draw.text((cx - w // 2, cy - h // 2 + 10), valor_texto, fill=(245, 248, 250), font=f_val)

    # Subtexto debajo del valor (incluye el label ICML)
    f_sub = load_sans(15, bold=True)
    bbox = draw.textbbox((0, 0), sub_texto, font=f_sub)
    draw.text((cx - (bbox[2] - bbox[0]) // 2, cy + 55), sub_texto, fill=AZUL_CLARO, font=f_sub)


# ----------------------------------------------------------------------------
# Layout principal
# ----------------------------------------------------------------------------
def make_landscape():
    img = make_gradient_bg(W, H, AZUL_OSCURO, (15, 23, 42), (30, 41, 59))
    draw = ImageDraw.Draw(img, "RGBA")

    # === Logo block ML (esquina superior izquierda) ===
    logo_x, logo_y, logo_size = 70, 70, 78
    # cuadrado ML con borde
    draw.rounded_rectangle(
        (logo_x, logo_y, logo_x + logo_size, logo_y + logo_size),
        radius=14, fill=(245, 248, 250), outline=AZUL_CLARO, width=2
    )
    f_logo = load_serif(54, bold=True)
    txt = "ML"
    bbox = draw.textbbox((0, 0), txt, font=f_logo)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((logo_x + (logo_size - tw) // 2 - 1, logo_y + (logo_size - th) // 2 - 14),
              txt, fill=AZUL_OSCURO, font=f_logo)

    # "Monitor Laboral" al lado del logo (nombre corto, como aparece en og:title)
    f_brand = load_sans(22, bold=True)
    draw.text((logo_x + logo_size + 18, logo_y + 8), "MONITOR LABORAL", fill=(245, 248, 250), font=f_brand)
    f_sub = load_sans(14)
    draw.text((logo_x + logo_size + 18, logo_y + 38), "Monitor del Mercado Laboral en Chile", fill=AZUL_CLARO, font=f_sub)

    # === Título principal ===
    f_title = load_serif(56, bold=True)
    title_lines = [
        "El mercado laboral chileno,",
        "medido en datos verificados.",
    ]
    y = 195
    for line in title_lines:
        bbox = draw.textbbox((0, 0), line, font=f_title)
        draw.text((70, y), line, fill=(245, 248, 250), font=f_title)
        y += 68

    # === Sub-categorías: chips ===
    chips = ["ICML", "Empleo", "Informalidad", "Remuneraciones", "Jornada 40h", "Protección social"]
    f_chip = load_sans(15, bold=True)
    x_chip = 70
    y_chip = 410
    for c in chips:
        bbox = draw.textbbox((0, 0), c, font=f_chip)
        cw = (bbox[2] - bbox[0]) + 26
        ch = 32
        draw.rounded_rectangle(
            (x_chip, y_chip, x_chip + cw, y_chip + ch),
            radius=16, fill=(30, 70, 110), outline=AZUL_CLARO, width=1
        )
        draw.text((x_chip + 13, y_chip + 7), c, fill=AZUL_PALIDO, font=f_chip)
        x_chip += cw + 10

    # === Footer: URL + autor ===
    f_url = load_sans(16, bold=True)
    draw.text((70, 555), "monitor-laboral.vercel.app", fill=AZUL_CLARO, font=f_url)
    f_credit = load_sans(13)
    draw.text((70, 580), "Datos: INE · Banco Central · SUSESO · AFC · OCDE · DT", fill=(140, 165, 190), font=f_credit)

    # === Gauge a la derecha ===
    draw_gauge(draw, cx=940, cy=320, radius=180, thickness=42,
               valor_relativo=0.56, valor_texto="56,2", sub_texto="ICML agregado · 2025")

    # Borde sutil
    draw.rectangle((0, 0, W - 1, H - 1), outline=(20, 50, 80), width=1)

    img.save(os.path.join(os.path.dirname(__file__), "og-image.png"), "PNG", optimize=True)
    print(f"og-image.png  {img.size}  {os.path.getsize(os.path.join(os.path.dirname(__file__), 'og-image.png')):,} bytes")


def make_square():
    """1200x1200 para Instagram, WhatsApp, etc."""
    W2, H2 = 1200, 1200
    img = make_gradient_bg(W2, H2, AZUL_OSCURO, (15, 23, 42), (30, 41, 59))
    draw = ImageDraw.Draw(img, "RGBA")

    # Logo arriba centrado
    logo_size = 110
    cx_logo = W2 // 2 - logo_size // 2
    draw.rounded_rectangle(
        (cx_logo, 100, cx_logo + logo_size, 100 + logo_size),
        radius=18, fill=(245, 248, 250), outline=AZUL_CLARO, width=3
    )
    f_logo = load_serif(78, bold=True)
    txt = "ML"
    bbox = draw.textbbox((0, 0), txt, font=f_logo)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((cx_logo + (logo_size - tw) // 2 - 2, 100 + (logo_size - th) // 2 - 20),
              txt, fill=AZUL_OSCURO, font=f_logo)

    # Brand
    f_brand = load_sans(28, bold=True)
    brand = "MONITOR LABORAL"
    bbox = draw.textbbox((0, 0), brand, font=f_brand)
    draw.text(((W2 - (bbox[2] - bbox[0])) // 2, 240), brand, fill=(245, 248, 250), font=f_brand)
    f_sub = load_sans(18)
    sub = "Monitor del Mercado Laboral en Chile"
    bbox = draw.textbbox((0, 0), sub, font=f_sub)
    draw.text(((W2 - (bbox[2] - bbox[0])) // 2, 280), sub, fill=AZUL_CLARO, font=f_sub)

    # Gauge centrado
    draw_gauge(draw, cx=600, cy=680, radius=260, thickness=56,
               valor_relativo=0.56, valor_texto="56,2", sub_texto="ICML agregado · 2025")

    # Chips centrados (en grilla 2 filas)
    chips = ["ICML", "Empleo", "Informalidad", "Remuneraciones", "Jornada 40h", "Protección social"]
    f_chip = load_sans(18, bold=True)
    chip_w, chip_h, gap = 0, 42, 12
    chip_widths = []
    for c in chips:
        bbox = draw.textbbox((0, 0), c, font=f_chip)
        chip_widths.append((bbox[2] - bbox[0]) + 30)

    row1 = chips[:3]
    row1_w = sum(chip_widths[:3]) + gap * 2
    row2 = chips[3:]
    row2_w = sum(chip_widths[3:]) + gap * 2

    x = (W2 - row1_w) // 2
    y = 1010
    for i, c in enumerate(row1):
        cw = chip_widths[i]
        draw.rounded_rectangle((x, y, x + cw, y + chip_h), radius=21,
                               fill=(30, 70, 110), outline=AZUL_CLARO, width=1)
        bbox = draw.textbbox((0, 0), c, font=f_chip)
        draw.text((x + (cw - (bbox[2] - bbox[0])) // 2, y + 10), c, fill=AZUL_PALIDO, font=f_chip)
        x += cw + gap

    x = (W2 - row2_w) // 2
    y = 1010 + chip_h + 12
    for i, c in enumerate(row2):
        cw = chip_widths[3 + i]
        draw.rounded_rectangle((x, y, x + cw, y + chip_h), radius=21,
                               fill=(30, 70, 110), outline=AZUL_CLARO, width=1)
        bbox = draw.textbbox((0, 0), c, font=f_chip)
        draw.text((x + (cw - (bbox[2] - bbox[0])) // 2, y + 10), c, fill=AZUL_PALIDO, font=f_chip)
        x += cw + gap

    # URL al fondo
    f_url = load_sans(20, bold=True)
    url = "monitor-laboral.vercel.app"
    bbox = draw.textbbox((0, 0), url, font=f_url)
    draw.text(((W2 - (bbox[2] - bbox[0])) // 2, 1150), url, fill=AZUL_CLARO, font=f_url)

    img.save(os.path.join(os.path.dirname(__file__), "og-image-square.png"), "PNG", optimize=True)
    print(f"og-image-square.png  {img.size}  {os.path.getsize(os.path.join(os.path.dirname(__file__), 'og-image-square.png')):,} bytes")


if __name__ == "__main__":
    make_landscape()
    make_square()
    print("OK")
