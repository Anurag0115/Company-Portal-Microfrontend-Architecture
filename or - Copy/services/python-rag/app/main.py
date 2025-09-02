import os
from typing import Optional, List
import json
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")
CHAT_MODEL = os.getenv("CHAT_MODEL", "gpt-4o-mini")

if not OPENAI_API_KEY:
    print("⚠️  OPENAI_API_KEY not set. RAG features will not work.")
    client = None
else:
    client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="Knowledge Hub RAG API")

# CORS to allow local frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory storage (no Docker needed!)
documents = []
embeddings_cache = {}

class EmbedIndexRequest(BaseModel):
    id: str
    department: str
    title: str
    content: str

class QueryRequest(BaseModel):
    question: str
    department: Optional[str] = None
    top_k: int = 5

def get_embedding(text: str) -> List[float]:
    """Get embedding for text using OpenAI"""
    if not client:
        return [0.0] * 1536  # Default embedding size
    
    try:
        response = client.embeddings.create(model=EMBED_MODEL, input=text)
        return response.data[0].embedding
    except Exception as e:
        print(f"Embedding error: {e}")
        return [0.0] * 1536

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    if not a or not b or len(a) != len(b):
        return 0.0
    
    dot_product = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(x * x for x in b) ** 0.5
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
    
    return dot_product / (norm_a * norm_b)

@app.get("/health")
async def health():
    return {
        "status": "ok", 
        "documents_count": len(documents),
        "openai_configured": client is not None
    }

@app.post("/embed-index")
async def embed_index(body: EmbedIndexRequest):
    if not client:
        return {"error": "OpenAI API key not configured"}
    
    # Create document entry
    doc = {
        "id": body.id,
        "department": body.department,
        "title": body.title,
        "content": body.content,
        "created_at": datetime.now().isoformat()
    }
    
    # Generate embedding
    text_for_embedding = f"{body.title}\n\n{body.content}"
    embedding = get_embedding(text_for_embedding)
    
    # Store document and embedding
    documents.append(doc)
    embeddings_cache[body.id] = embedding
    
    return {"indexed": True, "id": body.id, "embedding_size": len(embedding)}

@app.post("/query")
async def query_rag(body: QueryRequest):
    if not client:
        return {"error": "OpenAI API key not configured"}
    
    if not documents:
        return {"answer": "No documents have been uploaded yet. Please upload some documents first."}
    
    # Generate query embedding
    query_embedding = get_embedding(body.question)
    
    # Find similar documents
    similarities = []
    for i, doc in enumerate(documents):
        if body.department and body.department != "All" and doc["department"] != body.department:
            continue
        
        doc_embedding = embeddings_cache.get(doc["id"], [0.0] * 1536)
        similarity = cosine_similarity(query_embedding, doc_embedding)
        similarities.append((similarity, doc))
    
    # Sort by similarity and get top results
    similarities.sort(key=lambda x: x[0], reverse=True)
    top_docs = similarities[:body.top_k]
    
    if not top_docs:
        return {"answer": "No relevant documents found for your question."}
    
    # Build context from top documents
    contexts = []
    for similarity, doc in top_docs:
        contexts.append(f"[Department: {doc['department']}] {doc['title']}: {doc['content']}")
    
    context_block = "\n\n".join(contexts)
    
    # Generate answer using OpenAI
    try:
        messages = [
            {"role": "system", "content": "You are a helpful company policy assistant. Answer strictly from the provided context. If the context doesn't contain relevant information, say so."},
            {"role": "user", "content": f"Question: {body.question}\n\nContext:\n{context_block}"}
        ]
        
        response = client.chat.completions.create(
            model=CHAT_MODEL, 
            messages=messages, 
            temperature=0.2
        )
        answer = response.choices[0].message.content
        return {"answer": answer, "sources": contexts}
    
    except Exception as e:
        return {"error": f"OpenAI API error: {str(e)}"}

@app.get("/documents")
async def list_documents():
    """List all uploaded documents"""
    return {"documents": documents}

@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a document by ID"""
    global documents, embeddings_cache
    
    for i, doc in enumerate(documents):
        if doc["id"] == doc_id:
            documents.pop(i)
            embeddings_cache.pop(doc_id, None)
            return {"deleted": True, "id": doc_id}
    
    return {"error": "Document not found"} 