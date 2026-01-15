import google.generativeai as genai
from config import get_settings
import sys

# Fix encoding for Windows
sys.stdout.reconfigure(encoding='utf-8')

# Initialize
settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

print("=" * 80)
print("AVAILABLE GEMINI MODELS WITH generateContent SUPPORT")
print("=" * 80)

models_info = []

for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        models_info.append({
            'name': model.name,
            'display_name': model.display_name,
            'description': model.description,
            'input_token_limit': model.input_token_limit,
            'output_token_limit': model.output_token_limit,
        })

# Sort by name
models_info.sort(key=lambda x: x['name'])

for i, model in enumerate(models_info, 1):
    print(f"\n{i}. {model['name']}")
    print(f"   Display Name: {model['display_name']}")
    desc = model['description'][:100] + "..." if len(model['description']) > 100 else model['description']
    print(f"   Description: {desc}")
    print(f"   Input Tokens: {model['input_token_limit']:,}")
    print(f"   Output Tokens: {model['output_token_limit']:,}")

print("\n" + "=" * 80)
print(f"TOTAL MODELS: {len(models_info)}")
print("=" * 80)

# Highlight vision-capable models
print("\nRECOMMENDED FOR VISION/IMAGE ANALYSIS:")
vision_models = [m for m in models_info if any(k in m['name'].lower() for k in ['1.5', 'flash', 'pro', 'vision'])]
for model in vision_models:
    print(f"   * {model['name']}")
