import os
import re
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

text = "Returns are accepted within 30 days with a receipt."

print("Step 1: Text ready, length:", len(text))

chunks = [text]  # just one chunk, no splitting
print("Step 2: Chunks:", chunks)

print("Step 3: Embedding chunk...")
result = genai.embed_content(model="models/gemini-embedding-001", content=chunks[0])
vector = result["embedding"]
print("Step 4: Embedding done, dimensions:", len(vector))

print("Step 5: Converting to numpy...")
embeddings = np.array([vector], dtype=np.float32)
print("Step 6: Numpy array shape:", embeddings.shape)

print("ALL STEPS PASSED - RAG pipeline works!")