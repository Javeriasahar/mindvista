from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import traceback

from rag_engine import RAGEngine

app = FastAPI(title="MindVista AI Support API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_engine = RAGEngine()


class AskRequest(BaseModel):
    question: str


@app.get("/")
def root():
    return {"status": "MindVista API is running"}


@app.post("/ingest")
async def ingest(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    try:
        if not text and not file:
            raise HTTPException(status_code=400, detail="Provide either text or a .txt file.")

        if file:
            if not file.filename.endswith(".txt"):
                raise HTTPException(status_code=400, detail="Only .txt files are supported.")
            raw_bytes = await file.read()
            content = raw_bytes.decode("utf-8", errors="ignore")
        else:
            content = text.strip()

        if not content:
            raise HTTPException(status_code=400, detail="Content is empty.")

        print(f"Ingesting content of length: {len(content)}")
        chunk_count = rag_engine.ingest(content)
        print(f"Ingestion complete. Chunks: {chunk_count}")

        return {"success": True, "message": "Content processed successfully.", "chunk_count": chunk_count}

    except HTTPException:
        raise
    except Exception as e:
        print("INGEST ERROR:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask")
async def ask(body: AskRequest):
    try:
        if not rag_engine.has_content():
            raise HTTPException(status_code=400, detail="No content ingested yet.")

        question = body.question.strip()
        if not question:
            raise HTTPException(status_code=400, detail="Question cannot be empty.")

        print(f"Question: {question}")
        result = await rag_engine.ask(question)
        print(f"Answer: {result['answer'][:80]}")

        return {
            "answer": result["answer"],
            "sources": result["sources"],
            "found_in_context": result["found_in_context"],
        }

    except HTTPException:
        raise
    except Exception as e:
        print("ASK ERROR:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/clear")
def clear():
    rag_engine.clear()
    return {"success": True, "message": "Knowledge base cleared."}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)