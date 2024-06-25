from PIL import Image, ImageDraw

def create_icon(size):
    # Create a white image
    image = Image.new("RGB", (size, size), "white")

    # Draw a red circle
    draw = ImageDraw.Draw(image)
    circle_radius = size // 4
    circle_center = (size // 2, size // 2)
    draw.ellipse([
        (circle_center[0] - circle_radius, circle_center[1] - circle_radius),
        (circle_center[0] + circle_radius, circle_center[1] + circle_radius)
    ], fill="red")

    return image

# Sizes required for Chrome extensions
sizes = [16, 48, 128]

for size in sizes:
    icon = create_icon(size)
    icon.save(f"icon_{size}.png")

print("Icons generated successfully!")
