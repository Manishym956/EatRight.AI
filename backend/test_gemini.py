import google.generativeai as genai
from config import get_settings
import PIL.Image
import io

# Initialize
settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

# Test with a simple image
print("Testing Gemini API...")
print(f"API Key (first 10 chars): {settings.gemini_api_key[:10]}...")

try:
    # List available models
    print("\nAvailable models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"  - {m.name}")
    
    # Try to use gemini-1.5-pro
    print("\nTrying gemini-1.5-pro...")
    model = genai.GenerativeModel('gemini-1.5-pro')
    
    # Create a simple test image
    from PIL import Image
    img = Image.new('RGB', (100, 100), color='red')
    
    response = model.generate_content(["What color is this image?", img])
    print(f"Success! Response: {response.text}")
    
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
