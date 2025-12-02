"""
Retrieval Agent - Performs hybrid search (embedding + keyword)

Part of RAG pipeline - combines vector similarity and keyword matching.
Simulates Qdrant HNSW search with ef_search=128.
"""

import time
import logging
import numpy as np
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


class RetrievalAgent:
    """
    Agent 3: Retrieval Agent
    
    Performs hybrid search combining:
    - Vector similarity (HNSW search)
    - Keyword matching (BM25-style)
    
    Returns top-K documents for reranking.
    """
    
    AGENT_NAME = "Retrieval Agent"
    AGENT_ROLE = "Hybrid Search & Retrieval"
    
    def __init__(
        self,
        top_k: int = 10,
        ef_search: int = 128,
        use_mock_db: bool = True
    ):
        """
        Initialize Retrieval Agent
        
        Args:
            top_k: Number of documents to retrieve
            ef_search: HNSW ef_search parameter (quality vs speed)
            use_mock_db: If True, use mock database; otherwise connect to Qdrant
        """
        self.top_k = top_k
        self.ef_search = ef_search
        self.use_mock_db = use_mock_db
        self.execution_count = 0
        
        # Mock document database
        self.mock_documents = self._create_mock_documents()
        
        if use_mock_db:
            logger.info(f"Retrieval Agent initialized with {len(self.mock_documents)} mock docs")
        else:
            logger.info("Retrieval Agent would connect to Qdrant here")
    
    def process(
        self,
        query_embedding: List[float],
        query_keywords: List[str],
        embedding_weight: float = 0.7,
        keyword_weight: float = 0.3
    ) -> Dict[str, Any]:
        """
        Perform hybrid retrieval
        
        Args:
            query_embedding: Query vector from Embedding Agent
            query_keywords: Query keywords from Keyword Agent
            embedding_weight: Weight for vector similarity (0-1)
            keyword_weight: Weight for keyword matching (0-1)
            
        Returns:
            Dict with top-K retrieved documents and scores
        """
        start_time = time.time()
        self.execution_count += 1
        
        # Perform hybrid search
        if self.use_mock_db:
            results = self._search_mock_db(
                query_embedding,
                query_keywords,
                embedding_weight,
                keyword_weight
            )
        else:
            results = self._search_qdrant(query_embedding, query_keywords)
        
        execution_time = time.time() - start_time
        
        return {
            "agent": self.AGENT_NAME,
            "role": self.AGENT_ROLE,
            "status": "success",
            "retrieved_documents": results,
            "retrieval_count": len(results),
            "search_parameters": {
                "top_k": self.top_k,
                "ef_search": self.ef_search,
                "embedding_weight": embedding_weight,
                "keyword_weight": keyword_weight,
                "search_type": "hybrid"
            },
            "metadata": {
                "execution_time_seconds": round(execution_time, 3),
                "execution_number": self.execution_count,
                "mock_mode": self.use_mock_db
            }
        }
    
    def _search_mock_db(
        self,
        query_embedding: List[float],
        query_keywords: List[str],
        emb_weight: float,
        kw_weight: float
    ) -> List[Dict[str, Any]]:
        """
        Search mock document database with hybrid scoring
        """
        scored_docs = []
        
        query_emb_np = np.array(query_embedding)
        query_keywords_lower = [kw.lower() for kw in query_keywords]
        
        for doc in self.mock_documents:
            # Vector similarity score (cosine similarity)
            doc_emb_np = np.array(doc["embedding"])
            vector_score = np.dot(query_emb_np, doc_emb_np)  # Already normalized
            
            # Keyword matching score
            doc_keywords = set(kw.lower() for kw in doc.get("keywords", []))
            keyword_matches = sum(1 for kw in query_keywords_lower if kw in doc_keywords)
            keyword_score = keyword_matches / max(len(query_keywords), 1)
            
            # Hybrid score
            hybrid_score = (emb_weight * vector_score) + (kw_weight * keyword_score)
            
            scored_docs.append({
                **doc,
                "vector_score": float(vector_score),
                "keyword_score": float(keyword_score),
                "hybrid_score": float(hybrid_score)
            })
        
        # Sort by hybrid score and return top-K
        scored_docs.sort(key=lambda x: x["hybrid_score"], reverse=True)
        return scored_docs[:self.top_k]
    
    def _search_qdrant(
        self,
        query_embedding: List[float],
        query_keywords: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Search using Qdrant (placeholder for production)
        """
        logger.info("Would connect to Qdrant here with ef_search={self.ef_search}")
        # Fall back to mock for demo
        return self._search_mock_db(query_embedding, query_keywords, 0.7, 0.3)
    
    def _create_mock_documents(self) -> List[Dict[str, Any]]:
        """
        Create mock document database for demonstration
        """
        documents = [
            {
                "id": "doc_001",
                "title": "High Net Worth Individual KYC Case - Technology Sector",
                "content": "Client is a technology entrepreneur with verified wealth from startup exit. Multiple jurisdictions including UK, Singapore. Clean compliance record.",
                "keywords": ["technology", "entrepreneur", "high-net-worth", "uk", "singapore", "clean"],
                "metadata": {
                    "case_type": "KYC",
                    "risk_level": "Low",
                    "date": "2024-Q1"
                },
                "embedding": None  # Will be set
            },
            {
                "id": "doc_002",
                "title": "Monaco Resident Private Equity Investor Review",
                "content": "Private equity fund manager based in Monaco. High transaction volume due to fund operations. Enhanced due diligence completed satisfactorily.",
                "keywords": ["monaco", "private-equity", "fund", "enhanced-due-diligence", "high-volume"],
                "metadata": {
                    "case_type": "Annual Review",
                    "risk_level": "Medium",
                    "date": "2024-Q2"
                },
                "embedding": None
            },
            {
                "id": "doc_003",
                "title": "Offshore Structure Compliance Analysis",
                "content": "Complex offshore corporate structure with entities in Cayman Islands and BVI. Beneficial ownership fully disclosed. Higher monitoring required.",
                "keywords": ["offshore", "cayman", "bvi", "corporate-structure", "beneficial-ownership"],
                "metadata": {
                    "case_type": "Enhanced DD",
                    "risk_level": "Medium",
                    "date": "2024-Q2"
                },
                "embedding": None
            },
            {
                "id": "doc_004",
                "title": "Real Estate Investment Portfolio Assessment",
                "content": "Real estate investor with diversified portfolio across Europe. Transparent fund flows. Standard risk profile.",
                "keywords": ["real-estate", "investment", "europe", "diversified", "transparent"],
                "metadata": {
                    "case_type": "KYC",
                    "risk_level": "Low",
                    "date": "2024-Q3"
                },
                "embedding": None
            },
            {
                "id": "doc_005",
                "title": "Cryptocurrency Trading Platform Founder Review",
                "content": "Founder of licensed cryptocurrency exchange. Significant crypto holdings. Enhanced monitoring for regulatory changes in digital asset space.",
                "keywords": ["cryptocurrency", "exchange", "digital-assets", "founder", "licensed"],
                "metadata": {
                    "case_type": "Enhanced DD",
                    "risk_level": "Medium",
                    "date": "2024-Q3"
                },
                "embedding": None
            },
            {
                "id": "doc_006",
                "title": "PEP Family Member Due Diligence",
                "content": "Family member of PEP with independent wealth sources. Comprehensive background checks completed. Ongoing monitoring recommended.",
                "keywords": ["pep", "family-member", "background-check", "monitoring", "independent-wealth"],
                "metadata": {
                    "case_type": "PEP Review",
                    "risk_level": "High",
                    "date": "2024-Q1"
                },
                "embedding": None
            },
            {
                "id": "doc_007",
                "title": "Pharmaceutical Industry Executive Onboarding",
                "content": "Senior pharmaceutical executive with stock options and annual bonus income. Clean professional background. Standard procedures.",
                "keywords": ["pharmaceutical", "executive", "professional", "stock-options", "clean"],
                "metadata": {
                    "case_type": "KYC",
                    "risk_level": "Low",
                    "date": "2024-Q2"
                },
                "embedding": None
            },
            {
                "id": "doc_008",
                "title": "Art Collector and Dealer Compliance Review",
                "content": "High-value art transactions. Provenance verification required. Cash-intensive business with appropriate controls.",
                "keywords": ["art", "collector", "high-value", "cash", "provenance"],
                "metadata": {
                    "case_type": "Annual Review",
                    "risk_level": "Medium",
                    "date": "2024-Q3"
                },
                "embedding": None
            },
            {
                "id": "doc_009",
                "title": "Family Office Wealth Management Setup",
                "content": "Establishing family office structure for multigenerational wealth. Complex but transparent structure. Standard elite client profile.",
                "keywords": ["family-office", "wealth-management", "multigenerational", "elite", "transparent"],
                "metadata": {
                    "case_type": "Onboarding",
                    "risk_level": "Low",
                    "date": "2024-Q1"
                },
                "embedding": None
            },
            {
                "id": "doc_010",
                "title": "Cross-Border Transaction Pattern Analysis",
                "content": "Increased cross-border wire transfers to emerging markets. Business purpose verified. Enhanced monitoring activated.",
                "keywords": ["cross-border", "wire-transfer", "emerging-markets", "monitoring", "verified"],
                "metadata": {
                    "case_type": "Transaction Monitoring",
                    "risk_level": "Medium",
                    "date": "2024-Q3"
                },
                "embedding": None
            }
        ]
        
        # Generate mock embeddings for each doc
        for doc in documents:
            # Simple embedding based on content hash for demonstration
            seed = hash(doc["content"]) % (2**32)
            np.random.seed(seed)
            embedding = np.random.randn(1536)
            embedding = embedding / np.linalg.norm(embedding)
            doc["embedding"] = embedding.tolist()
        
        return documents
    
    def get_status(self) -> Dict[str, Any]:
        """Get agent status"""
        return {
            "agent": self.AGENT_NAME,
            "status": "ready",
            "database": "mock" if self.use_mock_db else "qdrant",
            "document_count": len(self.mock_documents),
            "top_k": self.top_k,
            "ef_search": self.ef_search,
            "executions": self.execution_count
        }
    
    def __repr__(self) -> str:
        db = "mock" if self.use_mock_db else "qdrant"
        return f"<RetrievalAgent db={db} docs={len(self.mock_documents)} executions={self.execution_count}>"
