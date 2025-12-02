"""
Rerank Agent - Reranks retrieved documents using LLM

Part of RAG pipeline - takes top-K docs and reranks to top-N most relevant.
Uses GPT-4o-mini or mock scoring for demonstration.
"""

import time
import json
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class RerankAgent:
    """
    Agent 4: Rerank Agent
    
    Takes top-K retrieved documents and reranks them using:
    - LLM-based relevance scoring (GPT-4o-mini)
    - Returns top-N most relevant documents
    
    This improves precision by using more sophisticated relevance assessment.
    """
    
    AGENT_NAME = "Rerank Agent"
    AGENT_ROLE = "LLM-based Document Reranking"
    
    def __init__(
        self,
        top_n: int = 3,
        use_mock: bool = True
    ):
        """
        Initialize Rerank Agent
        
        Args:
            top_n: Number of top documents to return after reranking
            use_mock: If True, use mock reranking; otherwise use GPT-4o-mini
        """
        self.top_n = top_n
        self.use_mock = use_mock
        self.execution_count = 0
        
        if not use_mock:
            try:
                from openai import OpenAI
                import os
                self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
                self.model = "gpt-4o-mini"
                logger.info(f"Rerank Agent initialized with {self.model}")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI, using mock mode: {e}")
                self.use_mock = True
                self.client = None
        else:
            self.client = None
            logger.info("Rerank Agent initialized in mock mode")
    
    def process(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        top_n: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Rerank documents by relevance to query
        
        Args:
            query: Original user query
            documents: List of retrieved documents from Retrieval Agent
            top_n: Override default top_n
            
        Returns:
            Dict with reranked documents and scores
        """
        start_time = time.time()
        self.execution_count += 1
        
        n = top_n or self.top_n
        
        # Rerank documents
        if self.use_mock:
            reranked = self._rerank_mock(query, documents, n)
        else:
            reranked = self._rerank_with_llm(query, documents, n)
        
        execution_time = time.time() - start_time
        
        return {
            "agent": self.AGENT_NAME,
            "role": self.AGENT_ROLE,
            "status": "success",
            "query": query,
            "input_count": len(documents),
            "output_count": len(reranked),
            "reranked_documents": reranked,
            "metadata": {
                "execution_time_seconds": round(execution_time, 3),
                "execution_number": self.execution_count,
                "mock_mode": self.use_mock,
                "model": "mock" if self.use_mock else self.model
            }
        }
    
    def _rerank_mock(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        top_n: int
    ) -> List[Dict[str, Any]]:
        """
        Mock reranking using simple heuristics
        
        Combines:
        - Original hybrid score
        - Query-document keyword overlap
        - Document metadata (risk level preference)
        """
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
        scored_docs = []
        
        for doc in documents:
            # Start with original hybrid score
            base_score = doc.get("hybrid_score", 0.5)
            
            # Add keyword overlap bonus
            content = doc.get("content", "").lower()
            title = doc.get("title", "").lower()
            
            # Count query keyword matches in content and title
            content_matches = sum(1 for word in query_words if word in content)
            title_matches = sum(1 for word in query_words if word in title)
            
            keyword_bonus = (content_matches * 0.05) + (title_matches * 0.1)
            
            # Bonus for certain metadata
            metadata = doc.get("metadata", {})
            metadata_bonus = 0.0
            
            # Prefer more recent documents
            if "2024-Q3" in metadata.get("date", ""):
                metadata_bonus += 0.05
            
            # Final rerank score
            rerank_score = base_score + keyword_bonus + metadata_bonus
            rerank_score = min(1.0, rerank_score)  # Cap at 1.0
            
            scored_docs.append({
                **doc,
                "rerank_score": float(rerank_score),
                "scoring_breakdown": {
                    "base_hybrid_score": float(base_score),
                    "keyword_bonus": float(keyword_bonus),
                    "metadata_bonus": float(metadata_bonus)
                }
            })
        
        # Sort by rerank score
        scored_docs.sort(key=lambda x: x["rerank_score"], reverse=True)
        
        return scored_docs[:top_n]
    
    def _rerank_with_llm(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        top_n: int
    ) -> List[Dict[str, Any]]:
        """
        Rerank using GPT-4o-mini for relevance scoring
        """
        try:
            # Build prompt for LLM
            doc_list = []
            for i, doc in enumerate(documents):
                doc_list.append(
                    f"Document {i+1}:\n"
                    f"Title: {doc.get('title', 'Untitled')}\n"
                    f"Content: {doc.get('content', '')[:200]}...\n"
                )
            
            prompt = f"""You are a relevance scoring expert. Given a query and a list of documents, 
score each document's relevance to the query on a scale of 0.0 to 1.0.

Query: {query}

Documents:
{chr(10).join(doc_list)}

Return ONLY a JSON array of scores in order, like: [0.95, 0.82, 0.67, ...]
"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=200
            )
            
            # Parse scores
            scores_text = response.choices[0].message.content.strip()
            scores = json.loads(scores_text)
            
            # Attach scores to documents
            for i, doc in enumerate(documents):
                if i < len(scores):
                    doc["rerank_score"] = float(scores[i])
                else:
                    doc["rerank_score"] = 0.5
            
            # Sort and return top-N
            documents.sort(key=lambda x: x["rerank_score"], reverse=True)
            return documents[:top_n]
            
        except Exception as e:
            logger.error(f"LLM reranking failed: {e}, falling back to mock")
            return self._rerank_mock(query, documents, top_n)
    
    def get_status(self) -> Dict[str, Any]:
        """Get agent status"""
        return {
            "agent": self.AGENT_NAME,
            "status": "ready",
            "mode": "mock" if self.use_mock else f"llm ({self.model})",
            "top_n": self.top_n,
            "executions": self.execution_count
        }
    
    def __repr__(self) -> str:
        mode = "mock" if self.use_mock else self.model
        return f"<RerankAgent mode={mode} top_n={self.top_n} executions={self.execution_count}>"
