# MindVista — Smart AI Support Assistant

A full-stack context-aware AI chatbot that answers questions **strictly from user-provided content** using a **Basic RAG (Retrieval-Augmented Generation)** pipeline powered by **Google Gemini**.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS            |
| Backend   | Python 3.11+, FastAPI                   |
| Embeddings| Google Gemini `text-embedding-004`      |
| LLM       | Google Gemini `gemini-1.5-flash`        |
| Retrieval | Cosine similarity (NumPy, in-memory)    |

---

## Project Structure

```
mindvista/
├── backend/
│   ├── main.py          # FastAPI app — /ingest, /ask, /clear endpoints
│   ├── rag_engine.py    # RAG pipeline: chunking, embedding, retrieval, generation
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── KnowledgeInput.jsx   # Page 1: paste text or upload .txt
    │   │   └── ChatInterface.jsx    # Page 2: chat UI with source highlighting
    │   ├── components/
    │   │   └── Layout.jsx           # Header, nav, footer
    │   └── utils/
    │       └── api.js               # Fetch wrappers for backend endpoints
    ├── index.html
    ├── vite.config.js
    └── tailwind.config.js
```

---

## How the RAG Pipeline Works

```
User pastes content
      │
      ▼
[1] Chunking
      Split text into overlapping 400-char chunks (80-char overlap)
      Boundary-aware: breaks at sentence/word edges
      │
      ▼
[2] Embedding  (Google Gemini text-embedding-004)
      Each chunk → 768-dim dense vector
      Stored in NumPy array in memory
      │
      ▼
[3] Query comes in → embed the question
      │
      ▼
[4] Cosine similarity over all chunk embeddings
      Top-K (4) most relevant chunks retrieved
      Minimum similarity threshold: 0.30
      │
      ▼
[5] Prompt construction
      Context = joined top-K chunks
      System instructions: "Answer ONLY from context"
      │
      ▼
[6] Gemini 1.5 Flash generates answer
      If context is insufficient → returns standard fallback message
```

---

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Google Gemini API key](https://makersuite.google.com/app/apikey)

---

### Backend

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set your API key
cp .env.example .env
# Edit .env and set: GEMINI_API_KEY=your_key_here

# 4. Run the server
uvicorn main:app --reload --port 8000
```

API will be available at `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

---

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

App will be available at `http://localhost:3000`

> The Vite dev proxy forwards `/ingest`, `/ask`, `/clear` to `localhost:8000` automatically.

---

## API Reference

### `POST /ingest`
Accepts form data:
- `text` (string) — raw pasted content
- `file` (`.txt` file) — text file upload

Returns: `{ success, message, chunk_count }`

### `POST /ask`
Body: `{ "question": "..." }`  
Returns: `{ answer, sources, found_in_context }`

### `DELETE /clear`
Clears the in-memory knowledge base.

---

## Assumptions

1. **In-memory storage** — the knowledge base is stored in RAM per server process. Restarting the server clears it. A production version would use a vector DB (Pinecone, ChromaDB, etc.).
2. **Single-user session** — no multi-tenancy. One active knowledge base at a time.
3. **Text only** — only `.txt` files are supported for upload. PDF/DOCX parsing was out of scope.
4. **Similarity threshold** — chunks with cosine similarity below `0.30` are excluded from context, triggering the "not found" response. This value can be tuned in `rag_engine.py`.

---

## Limitations & Possible Improvements

| Limitation | Improvement |
|---|---|
| In-memory vector store | Integrate ChromaDB or Pinecone for persistence |
| No streaming | Add SSE/WebSocket streaming for typing effect |
| Single knowledge base | Add user sessions / multiple documents |
| No PDF support | Add PyMuPDF or pdfminer for PDF ingestion |
| Fixed chunk size | Dynamic chunking based on semantic boundaries |
| No chat memory | Add conversation history to the prompt |
