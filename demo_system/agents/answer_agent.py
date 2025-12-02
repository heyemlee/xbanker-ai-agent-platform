"""
Answer Agent - Generates final answer using retrieved context

Part of RAG pipeline - takes top-N reranked docs and generates streaming answer.
Uses LLM with retrieved context to provide accurate, grounded responses.
"""

import time
import logging
from typing import List, Dict, Any, Optional, Iterator

logger = logging.getLogger(__name__)


class AnswerAgent:
    """
    Agent 5: Answer Generation Agent
    
    Takes reranked documents and generates final answer:
    - Builds context from top documents
    - Uses LLM to generate grounded response
    - Supports streaming for UX
    """
    
    AGENT_NAME = "Answer Agent"
    AGENT_ROLE = "Context-based Answer Generation"
    
    def __init__(self, use_mock: bool = True, enable_streaming: bool = True):
        """
        Initialize Answer Agent
        
        Args:
            use_mock: If True, use mock answers; otherwise use LLM
            enable_streaming: If True, support streaming responses
        """
        self.use_mock = use_mock
        self.enable_streaming = enable_streaming
        self.execution_count = 0
        
        if not use_mock:
            try:
                from openai import OpenAI
                import os
                self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
                self.model = "gpt-4o-mini"
                logger.info(f"Answer Agent initialized with {self.model}")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI, using mock mode: {e}")
                self.use_mock = True
                self.client = None
        else:
            self.client = None
            logger.info("Answer Agent initialized in mock mode")
    
    def process(
        self,
        query: str,
        context_documents: List[Dict[str, Any]],
        stream: bool = False
    ) -> Dict[str, Any]:
        """
        Generate answer from query and context
        
        Args:
            query: User's question
            context_documents: Retrieved and reranked documents
            stream: If True, return streaming response
            
        Returns:
            Dict with generated answer and metadata
        """
        start_time = time.time()
        self.execution_count += 1
        
        # Build context from documents
        context_text = self._build_context(context_documents)
        
        # Generate answer
        if stream and self.enable_streaming:
            # Return streaming response
            return self._generate_streaming(query, context_text, context_documents, start_time)
        else:
            # Return complete response
            if self.use_mock:
                answer = self._generate_mock_answer(query, context_documents)
            else:
                answer = self._generate_llm_answer(query, context_text)
            
            execution_time = time.time() - start_time
            
            return {
                "agent": self.AGENT_NAME,
                "role": self.AGENT_ROLE,
                "status": "success",
                "query": query,
                "answer": answer,
                "context_documents_used": len(context_documents),
                "citations": [
                    {
                        "doc_id": doc.get("id"),
                        "title": doc.get("title"),
                        "score": doc.get("rerank_score", 0.0)
                    }
                    for doc in context_documents
                ],
                "metadata": {
                    "execution_time_seconds": round(execution_time, 3),
                    "execution_number": self.execution_count,
                    "mock_mode": self.use_mock,
                    "streaming": False,
                    "model": "mock" if self.use_mock else self.model
                }
            }
    
    def _build_context(self, documents: List[Dict[str, Any]]) -> str:
        """
        Build context string from documents
        """
        context_parts = []
        
        for i, doc in enumerate(documents):
            context_parts.append(
                f"[Document {i+1}] {doc.get('title', 'Untitled')}\n"
                f"{doc.get('content', '')}\n"
            )
        
        return "\n".join(context_parts)
    
    def _generate_mock_answer(
        self,
        query: str,
        documents: List[Dict[str, Any]]
    ) -> str:
        """
        Generate mock answer based on query and documents
        """
        # Analyze query intent
        query_lower = query.lower()
        
        if "风险" in query or "risk" in query_lower:
            # Risk-related query
            risk_docs = [d for d in documents if "risk" in d.get("content", "").lower()]
            if risk_docs:
                return f"""Based on the analysis of {len(documents)} similar cases, the risk assessment indicates:

**Risk Level**: Medium

**Key Findings**:
- {len(risk_docs)} cases with similar risk profiles identified
- Common factors include multiple jurisdictions and cross-border transactions
- Historical precedents suggest enhanced monitoring is appropriate

**Recommendation**:
Enhanced due diligence procedures should be applied, including:
1. Quarterly transaction monitoring
2. Source of funds verification for large transfers
3. Annual compliance review

This assessment is based on {len(documents)} historical cases retrieved from the compliance database."""
        
        elif "kyc" in query_lower or "审查" in query or "onboard" in query_lower:
            # KYC/onboarding query
            return f"""**KYC Analysis Summary**

Based on review of {len(documents)} similar client profiles:

**Client Profile Assessment**:
- Background appears consistent with stated business activities
- Wealth sources align with professional history
- Jurisdictional exposure within acceptable parameters

**Compliance Checks**:
✓ PEP screening: Clear
✓ Sanctions screening: Clear
✓ Adverse media: No significant findings

**Documents Reviewed**: {len(documents)} historical cases

**Recommendation**: Approve for standard onboarding with routine monitoring procedures.

**Next Steps**:
1. Complete final identity verification
2. Establish account with standard limits
3. Schedule 12-month review"""
        
        elif "总结" in query or "summary" in query_lower or "summarize" in query_lower:
            # Summary query
            top_doc = documents[0] if documents else {}
            return f"""**Document Summary**

{top_doc.get('title', 'Document Analysis')}

{top_doc.get('content', 'Content not available')}

**Key Points**:
- Case type: {top_doc.get('metadata', {}).get('case_type', 'N/A')}
- Risk level: {top_doc.get('metadata', {}).get('risk_level', 'N/A')}
- Reference cases analyzed: {len(documents)}

This summary is generated from {len(documents)} related documents in the knowledge base."""
        
        else:
            # Generic query
            return f"""Based on analysis of {len(documents)} relevant documents from our knowledge base:

The information retrieved covers various aspects of compliance and KYC procedures. The documents include case studies, risk assessments, and procedural guidelines.

**Key Insights**:
- Multiple precedent cases provide guidance for similar situations
- Risk factors have been evaluated across {len(documents)} comparable scenarios
- Compliance standards align with regulatory requirements

**Sources**: {len(documents)} documents from internal compliance repository

For more specific analysis, please refine your query to focus on particular aspects such as risk assessment, onboarding procedures, or regulatory compliance."""
    
    def _generate_llm_answer(
        self,
        query: str,
        context_text: str
    ) -> str:
        """
        Generate answer using LLM with context
        """
        try:
            system_prompt = """You are a compliance and KYC expert assistant. 
Use the provided context documents to answer questions accurately.
If the context doesn't contain relevant information, say so.
Always cite which documents you're referencing."""
            
            user_prompt = f"""Context Documents:
{context_text}

Question: {query}

Please provide a comprehensive answer based on the context provided."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.4,
                max_tokens=800
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"LLM answer generation failed: {e}, using mock")
            # Fall back to mock
            return self._generate_mock_answer(query, [])
    
    def _generate_streaming(
        self,
        query: str,
        context_text: str,
        documents: List[Dict[str, Any]],
        start_time: float
    ) -> Dict[str, Any]:
        """
        Generate streaming response
        
        For demo, returns non-streaming result with streaming flag.
        In production, would return Iterator[str] for actual streaming.
        """
        # Generate complete answer
        if self.use_mock:
            answer = self._generate_mock_answer(query, documents)
        else:
            answer = self._generate_llm_answer(query, context_text)
        
        execution_time = time.time() - start_time
        
        # Return as if streaming (simplified for demo)
        return {
            "agent": self.AGENT_NAME,
            "role": self.AGENT_ROLE,
            "status": "success",
            "query": query,
            "answer": answer,
            "streaming": True,
            "streaming_note": "In production, this would stream tokens in real-time",
            "context_documents_used": len(documents),
            "citations": [
                {
                    "doc_id": doc.get("id"),
                    "title": doc.get("title"),
                    "score": doc.get("rerank_score", 0.0)
                }
                for doc in documents
            ],
            "metadata": {
                "execution_time_seconds": round(execution_time, 3),
                "execution_number": self.execution_count,
                "mock_mode": self.use_mock,
                "model": "mock" if self.use_mock else self.model
            }
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get agent status"""
        return {
            "agent": self.AGENT_NAME,
            "status": "ready",
            "mode": "mock" if self.use_mock else f"llm ({self.model})",
            "streaming_enabled": self.enable_streaming,
            "executions": self.execution_count
        }
    
    def __repr__(self) -> str:
        mode = "mock" if self.use_mock else self.model
        return f"<AnswerAgent mode={mode} streaming={self.enable_streaming} executions={self.execution_count}>"
