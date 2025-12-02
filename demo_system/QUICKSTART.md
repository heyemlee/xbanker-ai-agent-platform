# Quick Start Guide

This is a quick reference for running the Multi-Agent + MCP demo system.

## Installation

```bash
# Install dependencies (from project root)
cd /Users/lihaoyang/Desktop/xbanker.ai
pip install numpy colorama

# Navigate to demo system
cd demo_system
```

## Running the Demo

```bash
# Interactive CLI demo
python demo_runner.py
```

## Testing Individual Components

```bash
# Test MCP Server
python -c "from mcp_server import get_mcp_server; print(get_mcp_server().get_server_info())"

# Test Embedding Agent
python -c "from agents.embedding_agent import EmbeddingAgent; agent = EmbeddingAgent(); print(agent.process('test')['status'])"

# Test Keyword Agent  
python -c "from agents.keyword_agent import KeywordAgent; agent = KeywordAgent(); print(agent.process('test')['status'])"

# Test Orchestrator
python -c "import asyncio; from orchestrator import get_orchestrator; print(asyncio.run(get_orchestrator().execute_query('test'))['workflow_type'])"
```

## Demo Scenarios

1. **Full KYC Review**: Select option 1
2. **Quick Risk Check**: Select option 2
3. **RAG Summary**: Select option 3

## Documentation

- **Architecture**: `docs/ARCHITECTURE.md`
- **Scenarios**: `docs/DEMO_SCENARIOS.md`
- **Interview Script**: `docs/INTERVIEW_SCRIPT.md`
- **Full README**: `README.md`

## For Interview

1. Run `python demo_runner.py`
2. Show Scenario 1 (Full KYC Review)
3. Reference `docs/INTERVIEW_SCRIPT.md` for talking points

---

**System Status**: ✅ All components verified working
