"""
Configuration for Multi-Agent + MCP Demo System
"""

import os
from typing import Optional

class DemoConfig:
    """Configuration for demo system"""
    
    # LLM Settings
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    USE_MOCK_LLM: bool = not bool(OPENAI_API_KEY)  # Auto-detect
    
    # MCP Server Settings
    MCP_SERVER_HOST: str = "localhost"
    MCP_SERVER_PORT: int = 8765
    
    # Agent Settings
    AGENT_TIMEOUT_SECONDS: int = 30
    ENABLE_PARALLEL_AGENTS: bool = True  # Run Embedding + Keyword in parallel
    
    # RAG Settings
    EMBEDDING_DIM: int = 1536  # OpenAI embedding dimension
    TOP_K_RETRIEVAL: int = 10  # Retrieve top-10 docs
    TOP_K_RERANK: int = 3      # Rerank to top-3
    QDRANT_EF_SEARCH: int = 128  # HNSW search parameter
    
    # Demo Settings
    USE_COLORED_OUTPUT: bool = True
    SHOW_EXECUTION_TIMING: bool = True
    VERBOSE_LOGGING: bool = True
    
    @classmethod
    def summary(cls) -> str:
        """Return configuration summary"""
        return f"""
Demo System Configuration:
- LLM: {cls.OPENAI_MODEL} (Mock Mode: {cls.USE_MOCK_LLM})
- MCP Server: {cls.MCP_SERVER_HOST}:{cls.MCP_SERVER_PORT}
- Parallel Agents: {cls.ENABLE_PARALLEL_AGENTS}
- RAG: Retrieve top-{cls.TOP_K_RETRIEVAL}, Rerank to top-{cls.TOP_K_RERANK}
- HNSW ef_search: {cls.QDRANT_EF_SEARCH}
        """.strip()

config = DemoConfig()
