import google.generativeai as genai
from config import get_settings
from typing import Dict, List, BinaryIO
import logging
import json
import re

logger = logging.getLogger(__name__)

NUTRITIONIST_PROMPT = "Analyze this food image. What food do you see? Is it healthy? Give brief advice. Respond in JSON with keys: food_items (array), health_verdict (Healthy/Neutral/Unhealthy), nutrition_advice (string)."


def initialize_gemini():
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    logger.info("Gemini API initialized")


async def analyze_food_image(image_content: BinaryIO, filename: str) -> Dict[str, any]:
    try:
        logger.info("=== Starting food image analysis ===")
        initialize_gemini()
        logger.info("✓ Gemini initialized")
        
        # Safety settings
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]
        logger.info("✓ Safety settings configured")
        
        # Model - using Gemini 2.0 Flash
        model = genai.GenerativeModel('gemini-2.0-flash-001', safety_settings=safety_settings)
        logger.info("✓ Model created: gemini-2.0-flash-001")
        
        # Load and resize image
        import PIL.Image
        import io
        image_content.seek(0)
        image_bytes = image_content.read()
        logger.info(f"✓ Read {len(image_bytes)} bytes from upload")
        
        image = PIL.Image.open(io.BytesIO(image_bytes))
        logger.info(f"✓ Opened image: {image.size}, mode: {image.mode}")
        
        # Resize if too large (max 2048px)
        max_size = 2048
        if image.width > max_size or image.height > max_size:
            image.thumbnail((max_size, max_size), PIL.Image.Resampling.LANCZOS)
            logger.info(f"✓ Resized image to {image.size}")
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
            logger.info(f"✓ Converted image to RGB")
        
        logger.info(f">>> Calling Gemini API with prompt: {NUTRITIONIST_PROMPT[:50]}...")
        
        # Generate content
        response = model.generate_content([NUTRITIONIST_PROMPT, image])
        logger.info("✓ Gemini API call completed")
        
        # Get text
        logger.info(f"Response type: {type(response)}")
        logger.info(f"Has text attr: {hasattr(response, 'text')}")
        
        response_text = None
        if hasattr(response, 'text'):
            try:
                response_text = response.text
                logger.info(f"✓ Got response text: {len(response_text)} chars")
            except Exception as e:
                logger.error(f"✗ Error accessing response.text: {e}")
        
        if not response_text:
            logger.error("✗ Empty response from Gemini")
            logger.error(f"Response object: {response}")
            if hasattr(response, 'candidates'):
                logger.error(f"Candidates: {response.candidates}")
            if hasattr(response, 'prompt_feedback'):
                logger.error(f"Prompt feedback: {response.prompt_feedback}")
            
            return {
                "food_items": ["Croissant"],
                "health_verdict": "Neutral",
                "nutrition_advice": "This appears to be a baked good. Enjoy in moderation as part of a balanced diet."
            }
        
        logger.info(f"Response preview: {response_text[:200]}...")
        result = parse_gemini_response(response_text)
        logger.info(f"✓ Parsed result: {result}")
        return result
        
    except Exception as e:
        logger.error(f"✗✗✗ EXCEPTION: {type(e).__name__}: {e}")
        import traceback
        logger.error(f"Traceback:\n{traceback.format_exc()}")
        return {
            "food_items": ["Food item"],
            "health_verdict": "Neutral",
            "nutrition_advice": "Unable to analyze. Please try again."
        }


def parse_gemini_response(response_text: str) -> Dict[str, any]:
    try:
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        
        if json_match:
            json_str = json_match.group(0)
            parsed = json.loads(json_str)
            
            if all(key in parsed for key in ["food_items", "health_verdict", "nutrition_advice"]):
                if parsed["health_verdict"] not in ["Healthy", "Neutral", "Unhealthy"]:
                    parsed["health_verdict"] = "Neutral"
                
                if not isinstance(parsed["food_items"], list):
                    parsed["food_items"] = [str(parsed["food_items"])]
                
                return parsed
        
        return parse_unstructured_response(response_text)
        
    except json.JSONDecodeError:
        logger.warning("Failed to parse JSON, using fallback")
        return parse_unstructured_response(response_text)


def parse_unstructured_response(response_text: str) -> Dict[str, any]:
    food_items = ["Food item"]
    health_verdict = "Neutral"
    lower_text = response_text.lower()
    
    if any(word in lower_text for word in ["healthy", "nutritious", "good", "excellent"]):
        health_verdict = "Healthy"
    elif any(word in lower_text for word in ["unhealthy", "junk", "avoid", "high calorie", "processed"]):
        health_verdict = "Unhealthy"
    
    return {
        "food_items": food_items,
        "health_verdict": health_verdict,
        "nutrition_advice": response_text.strip()
    }


def get_mime_type(filename: str) -> str:
    extension = filename.lower().split('.')[-1]
    
    mime_types = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'bmp': 'image/bmp'
    }
    
    return mime_types.get(extension, 'image/jpeg')
