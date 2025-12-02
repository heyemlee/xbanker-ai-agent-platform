"""
Demo Orchestrator - Coordinates agents and tools based on query intent

Uses LLM to analyze user query and route to appropriate workflow:
- Full KYC Review: OCR → RAG → Risk → Report
- Risk Check: Risk Tool only  
- Document Summary: RAG pipeline only
"""

import asyncio
import time
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from .agents.embedding_agent import EmbeddingAgent
from .agents.keyword_agent import KeywordAgent
from .agents.retrieval_agent import RetrievalAgent
from .agents.rerank_agent import RerankAgent
from .agents.answer_agent import AnswerAgent
from .mcp_server import get_mcp_server
from .config import config

logger = logging.getLogger(__name__)


class DemoOrchestrator:
    """
    Demo Orchestrator Agent
    
    Analyzes user queries and routes to appropriate workflow:
    1. Full KYC Document Review workflow
    2. Quick Risk Check workflow
    3. RAG-only Document Summary workflow
    """
    
    def __init__(self, use_mock: bool = True):
        """
        Initialize orchestrator with all agents and MCP tools
        
        Args:
            use_mock: If True, use mock mode for all agents/tools
        """
        self.use_mock = use_mock
        
        # Initialize RAG agents
        self.embedding_agent = EmbeddingAgent(use_mock=use_mock)
        self.keyword_agent = KeywordAgent(use_llm=False)  # Rule-based for speed
        self.retrieval_agent = RetrievalAgent(
            top_k=config.TOP_K_RETRIEVAL,
            ef_search=config.QDRANT_EF_SEARCH,
            use_mock_db=True
        )
        self.rerank_agent = RerankAgent(
            top_n=config.TOP_K_RERANK,
            use_mock=use_mock
        )
        self.answer_agent = AnswerAgent(
            use_mock=use_mock,
            enable_streaming=True
        )
        
        # Get MCP server
        self.mcp_server = get_mcp_server()
        
        # Execution log for demo visualization
        self.execution_log = []
        
        logger.info("Demo Orchestrator initialized")
    
    async def execute_query(self, user_query: str) -> Dict[str, Any]:
        """
        Main entry point - analyzes query and executes appropriate workflow
        
        Args:
            user_query: User's input query
            
        Returns:
            Complete workflow execution result with logs
        """
        start_time = time.time()
        self.execution_log = []
        
        # Step 1: Analyze query intent
        workflow_type = self._analyze_intent(user_query)
        
        self._log_step({
            "step": "Intent Analysis",
            "workflow_selected": workflow_type,
            "query": user_query
        })
        
        # Step 2: Route to appropriate workflow
        if workflow_type == "full_kyc_review":
            result = await self._execute_full_kyc_workflow(user_query)
        elif workflow_type == "risk_check":
            result = await self._execute_risk_check_workflow(user_query)
        elif workflow_type == "rag_summary":
            result = await self._execute_rag_workflow(user_query)
        else:
            result = await self._execute_rag_workflow(user_query)  # Default
        
        total_time = time.time() - start_time
        
        return {
            "query": user_query,
            "workflow_type": workflow_type,
            "result": result,
            "execution_log": self.execution_log,
            "total_execution_time": round(total_time, 2),
            "timestamp": datetime.now().isoformat()
        }
    
    def _analyze_intent(self, query: str) -> str:
        """
        Analyze user query to determine workflow type
        
        Simple rule-based routing for demo. In production would use LLM.
        """
        query_lower = query.lower()
        
        # Full KYC review triggers
        if any(keyword in query for keyword in ["审查文件", "审查这个", "kyc文件", "onboard"]):
            return "full_kyc_review"
        
        # Risk check triggers
        if any(keyword in query_lower for keyword in ["风险等级", "risk score", "risk level", "查询风险"]):
            return "risk_check"
        
        # RAG summary triggers (default)
        return "rag_summary"
    
    async def _execute_full_kyc_workflow(self, query: str) -> Dict[str, Any]:
        """
        Workflow 1: Full KYC Document Review
        
        Steps: OCR → RAG → Risk Score → Report Generator
        """
        self._log_step({"step": "Starting Full KYC Review Workflow"})
        
        # Step 1: OCR Tool
        ocr_result = self.mcp_server.execute_tool(
            tool_name="ocr_document_scanner",
            parameters={
                "document_path": "kyc_form.pdf",
                "language": "en"
            }
        )
        self._log_step({
            "step": "OCR Document Scanner (MCP Tool)",
            "tool": "ocr_document_scanner",
            "status": ocr_result.get("status"),
            "text_length": len(ocr_result.get("extracted_text", ""))
        })
        
        # Step 2: RAG Pipeline
        rag_result = await self._run_rag_pipeline(
            query=f"Analyze this KYC document: {ocr_result.get('extracted_text', '')[:500]}"
        )
        self._log_step({
            "step": "RAG Analysis Pipeline",
            "documents_retrieved": rag_result.get("documents_retrieved", 0),
            "answer_generated": True
        })
        
        # Step 3: Risk Score Tool
        risk_result = self.mcp_server.execute_tool(
            tool_name="risk_score_calculator",
            parameters={
                "client_name": "Client from KYC Document",
                "client_data": {
                    "jurisdictions": ["UK", "Monaco"],
                    "wealth_sources": ["Technology investments"]
                }
            }
        )
        self._log_step({
            "step": "Risk Score Calculator (MCP Tool)",
            "tool": "risk_score_calculator",
            "risk_level": risk_result.get("risk_level"),
            "risk_score": risk_result.get("risk_score")
        })
        
        # Step 4: Report Generator Tool
        report_result = self.mcp_server.execute_tool(
            tool_name="compliance_report_generator",
            parameters={
                "client_name": "Client from KYC Document",
                "ocr_data": ocr_result,
                "risk_data": risk_result,
                "report_type": "onboarding"
            }
        )
        self._log_step({
            "step": "Report Generator (MCP Tool)",
            "tool": "compliance_report_generator",
            "report_generated": report_result.get("status") == "success"
        })
        
        return {
            "workflow": "Full KYC Document Review",
            "ocr_extraction": ocr_result,
            "rag_analysis": rag_result,
            "risk_assessment": risk_result,
            "compliance_report": report_result,
            "final_decision": "Review Complete - See Report for Details"
        }
    
    async def _execute_risk_check_workflow(self, query: str) -> Dict[str, Any]:
        """
        Workflow 2: Quick Risk Check
        
        Steps: Risk Score Tool only
        """
        self._log_step({"step": "Starting Quick Risk Check Workflow"})
        
        # Extract client name from query (simple extraction)
        # In production would use NER
        client_name = "Unknown Client"
        if "john" in query.lower():
            client_name = "John Smith"
        elif "james" in query.lower():
            client_name = "James Anderson"
        
        # Call Risk Score Tool
        risk_result = self.mcp_server.execute_tool(
            tool_name="risk_score_calculator",
            parameters={
                "client_name": client_name,
                "client_data": {}
            }
        )
        
        self._log_step({
            "step": "Risk Score Calculator (MCP Tool)",
            "tool": "risk_score_calculator",
            "client": client_name,
            "risk_level": risk_result.get("risk_level"),
            "risk_score": risk_result.get("risk_score")
        })
        
        return {
            "workflow": "Quick Risk Check",
            "client_name": client_name,
            "risk_assessment": risk_result,
            "final_answer": f"{client_name}: {risk_result.get('risk_level')} Risk (Score: {risk_result.get('risk_score')}/100)"
        }
    
    async def _execute_rag_workflow(self, query: str) -> Dict[str, Any]:
        """
        Workflow 3: RAG-only Document Summary
        
        Steps: Embed → Retrieve → Rerank → Answer
        """
        self._log_step({"step": "Starting RAG Pipeline Workflow"})
        
        rag_result = await self._run_rag_pipeline(query)
        
        return {
            "workflow": "RAG Document Summary",
            "rag_pipeline": rag_result,
            "final_answer": rag_result.get("answer", "")
        }
    
    async def _run_rag_pipeline(self, query: str) -> Dict[str, Any]:
        """
        Run complete RAG pipeline: Embed → Keyword → Retrieve → Rerank → Answer
        
        Embedding and Keyword agents run in PARALLEL for efficiency.
        """
        # Step 1: Parallel execution - Embedding + Keyword
        if config.ENABLE_PARALLEL_AGENTS:
            self._log_step({"step": "Parallel: Embedding + Keyword Extraction"})
            
            # Run in parallel
            embed_task = asyncio.create_task(
                asyncio.to_thread(self.embedding_agent.process, query)
            )
            keyword_task = asyncio.to_thread(
                asyncio.to_thread(self.keyword_agent.process, query)
            )
            
            embed_result, keyword_result = await asyncio.gather(embed_task, keyword_task)
        else:
            # Sequential execution
            embed_result = self.embedding_agent.process(query)
            keyword_result = self.keyword_agent.process(query)
        
        self._log_step({
            "step": "Embedding Agent",
            "agent": "EmbeddingAgent",
            "embedding_dim": embed_result.get("embedding_dim")
        })
        
        self._log_step({
            "step": "Keyword Agent",
            "agent": "KeywordAgent",
            "keywords_extracted": keyword_result.get("keyword_count")
        })
        
        # Step 2: Retrieval Agent (hybrid search)
        retrieval_result = self.retrieval_agent.process(
            query_embedding=embed_result["embedding"],
            query_keywords=keyword_result["keywords"]
        )
        
        self._log_step({
            "step": "Retrieval Agent (Hybrid Search)",
            "agent": "RetrievalAgent",
            "documents_retrieved": retrieval_result.get("retrieval_count"),
            "ef_search": config.QDRANT_EF_SEARCH
        })
        
        # Step 3: Rerank Agent
        rerank_result = self.rerank_agent.process(
            query=query,
            documents=retrieval_result["retrieved_documents"]
        )
        
        self._log_step({
            "step": "Rerank Agent (LLM-based)",
            "agent": "RerankAgent",
            "input_docs": rerank_result.get("input_count"),
            "output_docs": rerank_result.get("output_count")
        })
        
        # Step 4: Answer Agent
        answer_result = self.answer_agent.process(
            query=query,
            context_documents=rerank_result["reranked_documents"],
            stream=False
        )
        
        self._log_step({
            "step": "Answer Agent (Generation)",
            "agent": "AnswerAgent",
            "answer_length": len(answer_result.get("answer", ""))
        })
        
        return {
            "query": query,
            "embedding": embed_result,
            "keywords": keyword_result,
            "retrieval": retrieval_result,
            "rerank": rerank_result,
            "answer": answer_result.get("answer"),
            "citations": answer_result.get("citations", []),
            "documents_retrieved": retrieval_result.get("retrieval_count"),
            "documents_used": rerank_result.get("output_count")
        }
    
    def _log_step(self, step_data: Dict[str, Any]):
        """Log execution step for visualization"""
        step_data["timestamp"] = datetime.now().isoformat()
        self.execution_log.append(step_data)
        
        if config.VERBOSE_LOGGING:
            logger.info(f"Orchestrator Step: {step_data.get('step', 'Unknown')}")
    
    def get_status(self) -> Dict[str, Any]:
        """Get orchestrator status"""
        return {
            "orchestrator": "Demo Orchestrator",
            "status": "ready",
            "agents": {
                "embedding": self.embedding_agent.get_status(),
                "keyword": self.keyword_agent.get_status(),
                "retrieval": self.retrieval_agent.get_status(),
                "rerank": self.rerank_agent.get_status(),
                "answer": self.answer_agent.get_status()
            },
            "mcp_server": self.mcp_server.get_server_info(),
            "workflows_available": [
                "full_kyc_review",
                "risk_check",
                "rag_summary"
            ]
        }
    
    def __repr__(self) -> str:
        return f"<DemoOrchestrator agents=5 mcp_tools=3>"


# Global instance
_orchestrator = None

def get_orchestrator(use_mock: bool = True) -> DemoOrchestrator:
    """Get global orchestrator instance"""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = DemoOrchestrator(use_mock=use_mock)
    return _orchestrator
