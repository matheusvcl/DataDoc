from PIL import Image
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
img = Image.open(os.path.join(base_dir, "DocDados.jpg")).convert("RGBA")

# Crop to square (center)
w, h = img.size
size = min(w, h)
left = (w - size) // 2
top = (h - size) // 2
img = img.crop((left, top, left + size, top + size))

# Remove background (make white/near-white pixels transparent)
data = img.getdata()
new_data = []
for item in data:
    if item[0] > 200 and item[1] > 200 and item[2] > 200:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)
img.putdata(new_data)

# Create output directory
out_dir = os.path.join(base_dir, "icons")
os.makedirs(out_dir, exist_ok=True)

# Generate icon sizes
sizes = {
    "32x32.png": 32,
    "128x128.png": 128,
    "128x128@2x.png": 256,
    "icon.png": 512,
}

for name, s in sizes.items():
    resized = img.resize((s, s), Image.LANCZOS)
    resized.save(os.path.join(out_dir, name), "PNG")
    print(f"Created {name} ({s}x{s})")

# Save as ICO (Windows)
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
ico_images = []
for s in ico_sizes:
    ico_images.append(img.resize(s, Image.LANCZOS))
ico_images[0].save(os.path.join(out_dir, "icon.ico"), format="ICO", sizes=ico_sizes, append_images=ico_images[1:])
print("Created icon.ico")

# Save as ICNS (macOS) - save as PNG
img.resize((512, 512), Image.LANCZOS).save(os.path.join(out_dir, "icon.icns"), "PNG")
print("Created icon.icns (as PNG)")

print("Done!")
