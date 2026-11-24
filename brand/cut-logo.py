# Cut the Morefin logo out of its white background.
# Star (3D, shaded): solid silhouette with holes filled, original colours kept.
# Wordmark (flat blue, pixel dissolve): alpha from the red channel, one flat brand colour.
import sys
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

src, out_dir = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert("RGB")).astype(float)
X0, Y0, X1, Y1 = 556, 438, 1460, 688      # logo box with a little air
SPLIT = 811                                # empty columns 796-826 sit between star and text
c = im[Y0:Y1, X0:X1]
H, W, _ = c.shape
R = c[..., 0]
BG = 254.0

# soft alpha everywhere from the red channel (bg R=254, solid blue R~6)
soft = np.clip((BG - R) / (BG - 12.0), 0, 1)
soft[soft < 0.05] = 0

# star: silhouette, holes (white bevels, glossy centre) filled, eroded 1px, then soft edge outside
sx = SPLIT - X0
core = (R[:, :sx] < 200).astype(np.uint8) * 255
m = Image.fromarray(core, "L")
pad = Image.new("L", (sx + 2, H + 2), 0); pad.paste(m, (1, 1))
ImageDraw.floodfill(pad, (0, 0), 128)
filled = np.asarray(pad)[1:-1, 1:-1] != 128
filled = np.asarray(Image.fromarray((filled * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3))) > 0
a_star = np.maximum(filled.astype(float), soft[:, :sx])
rgb_star = c[:, :sx].copy()
edge = (a_star > 0) & (a_star < 1)
for k in range(3):   # un-mix white from the anti-aliased edge
    ch = rgb_star[..., k]
    ch[edge] = np.clip((ch[edge] - 255 * (1 - a_star[edge])) / a_star[edge], 0, 255)

# wordmark: flat colour
BLUE = np.array([6, 70, 225], float)
a_text = soft[:, sx:]
rgb_text = np.broadcast_to(BLUE, (H, W - sx, 3))

rgba = np.zeros((H, W, 4))
rgba[:, :sx, :3] = rgb_star; rgba[:, :sx, 3] = a_star * 255
rgba[:, sx:, :3] = rgb_text; rgba[:, sx:, 3] = a_text * 255
logo = Image.fromarray(rgba.round().astype(np.uint8), "RGBA")
logo = logo.crop(logo.getbbox())
logo.save(f"{out_dir}/morefin-logo.png", optimize=True)

star = Image.fromarray(rgba[:, :sx].round().astype(np.uint8), "RGBA")
star = star.crop(star.getbbox())
s = max(star.size); sq = Image.new("RGBA", (s, s), (0, 0, 0, 0))
sq.paste(star, ((s - star.width) // 2, (s - star.height) // 2))
sq.save(f"{out_dir}/morefin-star.png", optimize=True)
print("logo", logo.size, "star", sq.size)
