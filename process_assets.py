import os
from PIL import Image, ImageDraw

ICON_SRC = r"C:\Users\Asus\.gemini\antigravity\brain\7de862f2-b08e-4bff-8802-e16357bfaf2f\app_icon_1791231061361.jpg"
SPLASH_SRC = r"C:\Users\Asus\.gemini\antigravity\brain\7de862f2-b08e-4bff-8802-e16357bfaf2f\splash_clean_1791231099241.jpg"
RES_DIR = r"android\app\src\main\res"
ASSETS_DIR = r"src\assets"

def make_round(img):
    img = img.convert("RGBA")
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, img.size[0], img.size[1]), fill=255)
    result = Image.new("RGBA", img.size, (0, 0, 0, 0))
    result.paste(img, (0, 0), mask=mask)
    return result

def main():
    os.makedirs(ASSETS_DIR, exist_ok=True)
    os.makedirs(os.path.join(RES_DIR, "drawable"), exist_ok=True)
    
    # 1. Process Splash Screen
    print("Processing Splash Screen...")
    splash_img = Image.open(SPLASH_SRC)
    # Save to src/assets
    splash_png_path = os.path.join(ASSETS_DIR, "splash.png")
    splash_img.save(splash_png_path, "PNG")
    print(f"Saved splash to {splash_png_path}")
    
    # Save to android drawable
    res_splash_path = os.path.join(RES_DIR, "drawable", "splash.png")
    splash_img.save(res_splash_path, "PNG")
    print(f"Saved splash to {res_splash_path}")
    
    # 2. Process App Icons
    print("Processing App Icons...")
    icon_img = Image.open(ICON_SRC).convert("RGBA")
    
    # Save high-res icon in assets
    icon_img.save(os.path.join(ASSETS_DIR, "app_icon.png"), "PNG")
    
    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    
    for folder, size in densities.items():
        folder_path = os.path.join(RES_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        # Standard launcher
        resized = icon_img.resize((size, size), Image.Resampling.LANCZOS)
        square_path = os.path.join(folder_path, "ic_launcher.png")
        resized.save(square_path, "PNG")
        
        # Round launcher
        round_icon = make_round(resized)
        round_path = os.path.join(folder_path, "ic_launcher_round.png")
        round_icon.save(round_path, "PNG")
        
        print(f"Generated {folder} ({size}x{size}): {square_path}, {round_path}")
        
    print("All assets successfully processed!")

if __name__ == "__main__":
    main()
