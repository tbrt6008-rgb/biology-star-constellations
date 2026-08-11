from __future__ import annotations

import math
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEPS = ROOT / ".video_deps"
if str(DEPS) not in sys.path:
    sys.path.insert(0, str(DEPS))

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


SRC = Path(
    r"C:\Users\Administrator\.codex\generated_images\019e8fbe-b239-74e0-af5d-489074f542be\ig_076d2f1fafcdf05a016a2138356c208190a1e6790db9f3882d.png"
)
OUT_DIR = ROOT / "public" / "design-assets"
OUT_MP4 = OUT_DIR / "astronaut-space-loop.mp4"
OUT_POSTER = OUT_DIR / "astronaut-space-loop-poster.png"

WIDTH = 1280
HEIGHT = 720
FPS = 24
DURATION = 8
FRAMES = FPS * DURATION


def cover_resize(img: Image.Image, width: int, height: int) -> Image.Image:
    src_w, src_h = img.size
    scale = max(width / src_w, height / src_h)
    resized = img.resize((int(src_w * scale), int(src_h * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - width) // 2
    top = (resized.height - height) // 2
    return resized.crop((left, top, left + width, top + height))


def eased_loop(t: float) -> float:
    return 0.5 - 0.5 * math.cos(t * math.tau)


def make_star_layer(width: int, height: int, seed: int, count: int, alpha: int) -> Image.Image:
    rng = random.Random(seed)
    layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for _ in range(count):
        x = rng.randrange(0, width)
        y = rng.randrange(0, int(height * 0.78))
        r = rng.choice([1, 1, 1, 2])
        a = rng.randrange(max(8, alpha // 4), alpha)
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(232, 238, 255, a))
    return layer.filter(ImageFilter.GaussianBlur(0.15))


def vignette(width: int, height: int) -> Image.Image:
    y, x = np.ogrid[-1:1:height * 1j, -1:1:width * 1j]
    dist = np.sqrt((x * 0.86) ** 2 + (y * 1.05) ** 2)
    mask = np.clip((dist - 0.34) / 0.78, 0, 1)
    alpha = (mask * 160).astype(np.uint8)
    arr = np.zeros((height, width, 4), dtype=np.uint8)
    arr[..., 3] = alpha
    return Image.fromarray(arr, "RGBA")


def render() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    base = cover_resize(Image.open(SRC).convert("RGB"), WIDTH, HEIGHT)
    base = ImageEnhance.Contrast(base).enhance(1.04)
    base = ImageEnhance.Color(base).enhance(0.94)

    star_a = make_star_layer(WIDTH, HEIGHT, 31, 110, 90)
    star_b = make_star_layer(WIDTH, HEIGHT, 83, 72, 62)
    dark_edges = vignette(WIDTH, HEIGHT)

    rng = random.Random(17)
    dust = [
        (
            rng.randrange(0, WIDTH),
            rng.randrange(int(HEIGHT * 0.76), HEIGHT),
            rng.uniform(0.35, 1.2),
            rng.randrange(18, 55),
            rng.uniform(8, 26),
        )
        for _ in range(95)
    ]

    writer = imageio.get_writer(
        OUT_MP4,
        fps=FPS,
        codec="libx264",
        quality=8,
        pixelformat="yuv420p",
        macro_block_size=16,
    )

    poster_frame = None
    for i in range(FRAMES):
        t = i / FRAMES
        loop = eased_loop(t)

        scale = 1.0 + 0.035 * loop
        pan_x = int(math.sin(t * math.tau) * 10)
        pan_y = int(-5 * loop)

        zoomed = base.resize((int(WIDTH * scale), int(HEIGHT * scale)), Image.Resampling.BICUBIC)
        left = (zoomed.width - WIDTH) // 2 + pan_x
        top = (zoomed.height - HEIGHT) // 2 + pan_y
        frame = zoomed.crop((left, top, left + WIDTH, top + HEIGHT)).convert("RGBA")

        twinkle = 0.55 + 0.45 * math.sin(t * math.tau * 2.0)
        layer_a = star_a.copy()
        layer_a.putalpha(int(58 + 24 * twinkle))
        layer_b = star_b.transform(
            (WIDTH, HEIGHT),
            Image.Transform.AFFINE,
            (1, 0, math.sin(t * math.tau) * 8, 0, 1, -t * 10),
            resample=Image.Resampling.BICUBIC,
        )
        layer_b.putalpha(int(32 + 20 * (1 - twinkle)))
        frame.alpha_composite(layer_a)
        frame.alpha_composite(layer_b)

        dust_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(dust_layer)
        for x, y, r, a, speed in dust:
            dx = (x + t * speed) % (WIDTH + 40) - 20
            dy = y + math.sin(t * math.tau + x * 0.01) * 2
            draw.ellipse((dx - r, dy - r, dx + r, dy + r), fill=(220, 126, 76, a))
        dust_layer = dust_layer.filter(ImageFilter.GaussianBlur(0.55))
        frame.alpha_composite(dust_layer)

        # Astronaut breathing cue: a subtle highlight pulse around the standing figure.
        pulse = 0.5 + 0.5 * math.sin(t * math.tau * 1.5)
        glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        gdraw = ImageDraw.Draw(glow)
        cx, cy = int(WIDTH * 0.50), int(HEIGHT * 0.735)
        gdraw.ellipse(
            (cx - 38, cy - 102, cx + 38, cy + 22),
            outline=(255, 238, 218, int(16 + 18 * pulse)),
            width=2,
        )
        glow = glow.filter(ImageFilter.GaussianBlur(7))
        frame.alpha_composite(glow)

        frame.alpha_composite(dark_edges)

        rgb = frame.convert("RGB")
        if i == FRAMES // 2:
            poster_frame = rgb.copy()
        writer.append_data(np.asarray(rgb))

    writer.close()
    if poster_frame:
        poster_frame.save(OUT_POSTER, quality=95)

    print(f"mp4={OUT_MP4}")
    print(f"poster={OUT_POSTER}")


if __name__ == "__main__":
    render()
