"""
Embedding Agent - Converts text into vector embeddings

Part of RAG pipeline - handles document/query vectorization.
For demo purposes, can use OpenAI embeddings or mock vectors.
"""

import time
import logging
from typing import List, Dict, Any, Optional
import numpy as np

logger = logging.getLogger(__name__)


class EmbeddingAgent:
    """
    Agent 1: Embedding Agent
    
    Converts text into vector embeddings for similarity search.
    In production RAG systems, this would use OpenAI, Cohere, or custom models.
    """
    
    AGENT_NAME = "Embedding Agent"
    AGENT_ROLE = "Document Vectorization"
    
    def __init__(self, use_mock: bool = True):
        """
        Initialize Embedding Agent
        
        Args:
            use_mock: If True, use mock embeddings; otherwise use OpenAI
        """
        self.use_mock = use_mock
        self.execution_count = 0
        self.embedding_dim = 1536  # OpenAI embedding dimension
        
        if not use_mock:
            try:
                from openai import OpenAI
                import os
                self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
                logger.info("Embedding Agent initialized with OpenAI")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI, using mock mode: {e}")
                self.use_mock = True
        else:
            self.client = None
            logger.info("Embedding Agent initialized in mock mode")
    
    def process(
        self,
        text: str,
        chunk_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate embedding for text
        
        Args:
            text: Input text to embed
            chunk_id: Optional identifier for the chunk
            
        Returns:
            Dict with embedding vector and metadata
        """
        start_time = time.time()
        self.execution_count += 1
        
        # Generate embedding
        if self.use_mock:
            embedding = self._generate_mock_embedding(text)
        else:
            embedding = self._generate_openai_embedding(text)
        
        execution_time = time.time() - start_time
        
        return {
            "agent": self.AGENT_NAME,
            "role": self.AGENT_ROLE,
            "status": "success",
            "chunk_id": chunk_id or f"chunk_{self.execution_count}",
            "text_length": len(text),
            "embedding": embedding,
            "embedding_dim": len(embedding),
            "metadata": {
                "execution_time_seconds": round(execution_time, 3),
                "execution_number": self.execution_count,
                "mock_mode": self.use_mock
            }
        }
    
    def process_batch(
        self,
        texts: List[str],
        chunk_ids: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Process multiple texts in batch (demonstrates parallel processing)
        
        Args:
            texts: List of texts to embed
            chunk_ids: Optional list of chunk identifiers
            
        Returns:
            List of embedding results
        """
        start_time = time.time()
        
        # In a real system, this would batch to the API
        # For demo, we show it can handle multiple texts
        results = []
        for i, text in enumerate(texts):
            chunk_id = chunk_ids[i] if chunk_ids and i < len(chunk_ids) else None
            result = self.process(text, chunk_id)
            results.append(result)
        
        batch_time = time.time() - start_time
        logger.info(f"Batch processed {len(texts)} texts in {batch_time:.2f}s")
        
        return results
    
    def _generate_mock_embedding(self, text: str) -> List[float]:
        """
        Generate deterministic mock embedding based on text
        
        Uses simple hashing to create reproducible vectors
        """
        # Use text hash to seed random generator for reproducibility
        seed = hash(text) % (2**32)
        np.random.seed(seed)
        
        # Generate normalized random vector
        embedding = np.random.randn(self.embedding_dim)
        embedding = embedding / np.linalg.norm(embedding)
        
        return embedding.tolist()
    
    def _generate_openai_embedding(self, text: str) -> List[float]:
        """
        Generate real embedding using OpenAI API
        """
        try:
            response = self.client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"OpenAI embedding failed: {e}, falling back to mock")
            return self._generate_mock_embedding(text)
    
    def get_status(self) -> Dict[str, Any]:
        """Get agent status"""
        return {
            "agent": self.AGENT_NAME,
            "status": "ready",
            "mode": "mock" if self.use_mock else "openai",
            "executions": self.execution_count,
            "embedding_dim": self.embedding_dim
        }
    
    def __repr__(self) -> str:
        mode = "mock" if self.use_mock else "openai"
        return f"<EmbeddingAgent mode={mode} executions={self.execution_count}>"
