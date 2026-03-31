import os
import re
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

EMBED_MODEL = "models/gemini-embedding-001"
CHAT_MODEL  = "gemini-2.5-flash"
TOP_K       = 3
NOT_FOUND   = "I don't have enough information to answer that."
THRESHOLD   = 0.10


def cosine_similarity(a, b):
    na = np.linalg.norm(a)
    nb = np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))


def make_chunks(text):
    text = " ".join(text.split())
    if len(text) > 8000:
        text = text[:8000]
    size = 800
    overlap = 80
    out = []
    i = 0
    while i < len(text):
        piece = text[i : i + size].strip()
        if piece:
            out.append(piece)
        i += size - overlap
    return out if out else [text]


class RAGEngine:
    def __init__(self):
        self.chunks = []
        self.embeddings = None

    def has_content(self):
        return len(self.chunks) > 0

    def clear(self):
        self.chunks = []
        self.embeddings = None

    def ingest(self, content):
        self.clear()
        chunks = make_chunks(content)
        vectors = []
        for idx, chunk in enumerate(chunks):
            print(f"Embedding {idx + 1}/{len(chunks)}")
            r = genai.embed_content(model=EMBED_MODEL, content=chunk)
            vectors.append(r["embedding"])
        self.chunks = chunks
        self.embeddings = np.array(vectors, dtype=np.float32)
        print(f"Done. {len(chunks)} chunks stored.")
        return len(chunks)

    def retrieve(self, question):
        r = genai.embed_content(model=EMBED_MODEL, content=question)
        qv = np.array(r["embedding"], dtype=np.float32)
        scores = [cosine_similarity(qv, self.embeddings[i]) for i in range(len(self.chunks))]
        ranked = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)
        results = []
        for idx, score in ranked[:TOP_K]:
            if score >= THRESHOLD:
                results.append((self.chunks[idx], score))
        return results

    async def ask(self, question):
        retrieved = self.retrieve(question)
        if not retrieved:
            return {"answer": NOT_FOUND, "sources": [], "found_in_context": False}

        context = "\n\n---\n\n".join([c for c, _ in retrieved])
        prompt = f"""You are a helpful assistant. Answer the question ONLY from the context below.
If the answer is not in the context, say exactly: "{NOT_FOUND}"

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:"""

        model = genai.GenerativeModel(CHAT_MODEL)
        response = model.generate_content(prompt)
        answer = response.text.strip()
        found = NOT_FOUND.lower() not in answer.lower()
        sources = [c[:120] + ("..." if len(c) > 120 else "") for c, _ in retrieved]
        return {"answer": answer, "sources": sources, "found_in_context": found}