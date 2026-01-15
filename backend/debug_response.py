import google.generativeai as genai
from config import get_settings
import PIL.Image

# Initialize
settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

print("Testing Gemini with actual food image analysis...")

# Create a test food image (orange circle to simulate food)
img = PIL.Image.new('RGB', (300, 300), color='white')
from PIL import ImageDraw
draw = ImageDraw.Draw(img)
draw.ellipse([50, 50, 250, 250], fill='orange')

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]

try:
    model = genai.GenerativeModel('gemini-2.5-flash', safety_settings=safety_settings)
    
    prompt = "What food does this look like? Just describe it briefly."
    
    print("Sending request...")
    response = model.generate_content([prompt, img])
    
    print(f"\nResponse object type: {type(response)}")
    print(f"Has text attribute: {hasattr(response, 'text')}")
    print(f"Response parts: {response.parts if hasattr(response, 'parts') else 'N/A'}")
    
    if hasattr(response, 'prompt_feedback'):
        print(f"Prompt feedback: {response.prompt_feedback}")
    
    if hasattr(response, 'candidates'):
        print(f"Candidates: {response.candidates}")
    
    # Try to get text
    try:
        text = response.text
        print(f"\n✓ SUCCESS! Response text: {text}")
    except Exception as e:
        print(f"\n✗ Error accessing response.text: {e}")
        
        # Try alternative access
        if hasattr(response, 'candidates') and response.candidates:
            print(f"Candidate content: {response.candidates[0].content}")
            
except Exception as e:
    print(f"\n✗ ERROR: {type(e).__name__}: {e}")
    import traceback
    print(traceback.format_exc())
