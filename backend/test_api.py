
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

models_to_try = [
    "gemini-2.5-flash",
    "gemini-2.5-pro", 
    "gemini-2.0-flash-001",
    "gemma-3-4b-it",
]

for model_name in models_to_try:
    try:
        model = genai.GenerativeModel(f"models/{model_name}")
        response = model.generate_content("Say hello in one word")
        print(f"SUCCESS with {model_name}:", response.text)
        break
    except Exception as e:
        print(f"FAILED {model_name}:", str(e)[:80])