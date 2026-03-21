import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyCajFfT6q04JXJ2EoifKLrRsF_CTPdrWOE"
genai.configure(api_key=GEMINI_API_KEY)

print("[*] Checking available models for your key...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"[!] Error listing models: {e}")
