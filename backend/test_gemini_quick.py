import google.generativeai as genai
from config import get_settings
import PIL.Image
import io

# Initialize
settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

print("Testing Gemini 2.5 Flash with vision...")
print(f"API Key: {settings.gemini_api_key[:20]}...")

try:
    # Create a simple test image (red square)
    img = PIL.Image.new('RGB', (200, 200), color='red')
    
    # Test with gemini-2.5-flash
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = "What color is this image? Just answer with the color name."
    response = model.generate_content([prompt, img])
    
    print(f"\n✓ SUCCESS!")
    print(f"Response: {response.text}")
    print(f"\ngemini-2.5-flash is working correctly!")
    
except Exception as e:
    print(f"\n✗ ERROR: {type(e).__name__}")
    print(f"Message: {e}")
    import traceback
    print(f"\nFull traceback:\n{traceback.format_exc()}")
