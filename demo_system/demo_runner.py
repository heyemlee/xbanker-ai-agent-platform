"""
Interactive Demo Runner - CLI for demonstrating Multi-Agent + MCP system

Provides colorful, interactive demonstration of the system's capabilities.
"""

import asyncio
import sys
import json
from typing import Dict, Any
from datetime import datetime

try:
    from colorama import init, Fore, Back, Style
    init(autoreset=True)
    HAS_COLOR = True
except ImportError:
    HAS_COLOR = False
    # Fallback to no colors
    class Fore:
        RED = GREEN = YELLOW = BLUE = MAGENTA = CYAN = WHITE = RESET = ""
    class Back:
        BLACK = ""
    class Style:
        BRIGHT = RESET_ALL = ""

from .orchestrator import get_orchestrator
from .config import config


class DemoRunner:
    """Interactive demo runner with colored output"""
    
    def __init__(self):
        self.orchestrator = get_orchestrator(use_mock=True)
        
    def print_header(self):
        """Print demo header"""
        print("\n" + "=" * 80)
        print(f"{Fore.CYAN}{Style.BRIGHT}Multi-Agent + MCP Tool Calling Demo System{Style.RESET_ALL}".center(80))
        print("=" * 80)
        print(f"{Fore.YELLOW}Interview Demonstration - xBanker AI Agent Platform{Style.RESET_ALL}".center(80))
        print("=" * 80 + "\n")
        
        print(f"{Fore.GREEN}System Configuration:{Style.RESET_ALL}")
        print(config.summary())
        print()
    
    def print_menu(self):
        """Print demo scenario menu"""
        print(f"\n{Fore.CYAN}{'=' * 80}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{Style.BRIGHT}Demo Scenarios:{Style.RESET_ALL}\n")
        print(f"{Fore.GREEN}1.{Style.RESET_ALL} Full KYC Document Review {Fore.YELLOW}(OCR → RAG → Risk → Report){Style.RESET_ALL}")
        print(f"{Fore.GREEN}2.{Style.RESET_ALL} Quick Risk Check {Fore.YELLOW}(Risk Tool Only){Style.RESET_ALL}")
        print(f"{Fore.GREEN}3.{Style.RESET_ALL} Document Summarization {Fore.YELLOW}(RAG Pipeline){Style.RESET_ALL}")
        print(f"{Fore.GREEN}4.{Style.RESET_ALL} Custom Query")
        print(f"{Fore.GREEN}5.{Style.RESET_ALL} Show System Status")
        print(f"{Fore.RED}0.{Style.RESET_ALL} Exit\n")
        print(f"{Fore.CYAN}{'=' * 80}{Style.RESET_ALL}\n")
    
    async def run_scenario_1(self):
        """Scenario 1: Full KYC Document Review"""
        query = "帮我审查这个客户的KYC文件"
        
        print(f"\n{Fore.MAGENTA}{Style.BRIGHT}Scenario 1: Full KYC Document Review{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}User Query: {Style.RESET_ALL}{query}\n")
        
        await self.execute_and_display(query)
    
    async def run_scenario_2(self):
        """Scenario 2: Quick Risk Check"""
        query = "查询 James Anderson 的风险等级"
        
        print(f"\n{Fore.MAGENTA}{Style.BRIGHT}Scenario 2: Quick Risk Check{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}User Query: {Style.RESET_ALL}{query}\n")
        
        await self.execute_and_display(query)
    
    async def run_scenario_3(self):
        """Scenario 3: Document Summarization"""
        query = "总结高净值客户的风险评估流程"
        
        print(f"\n{Fore.MAGENTA}{Style.BRIGHT}Scenario 3: Document Summarization{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}User Query: {Style.RESET_ALL}{query}\n")
        
        await self.execute_and_display(query)
    
    async def run_custom_query(self):
        """Run custom user query"""
        print(f"\n{Fore.MAGENTA}{Style.BRIGHT}Custom Query{Style.RESET_ALL}")
        query = input(f"{Fore.YELLOW}Enter your query: {Style.RESET_ALL}")
        
        if query.strip():
            await self.execute_and_display(query)
    
    async def execute_and_display(self, query: str):
        """Execute query and display results with visualization"""
        print(f"\n{Fore.CYAN}{'─' * 80}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{Style.BRIGHT}Executing Workflow...{Style.RESET_ALL}\n")
        
        # Execute
        start_time = datetime.now()
        result = await self.orchestrator.execute_query(query)
        end_time = datetime.now()
        
        # Display execution log
        print(f"{Fore.GREEN}{Style.BRIGHT}Execution Flow:{Style.RESET_ALL}\n")
        
        for i, step in enumerate(result.get("execution_log", []), 1):
            step_name = step.get("step", "Unknown Step")
            
            # Color based on agent/tool type
            if "MCP Tool" in step_name:
                color = Fore.MAGENTA
                icon = "🔧"
            elif "Agent" in step_name:
                color = Fore.BLUE
                icon = "🤖"
            elif "Parallel" in step_name:
                color = Fore.CYAN
                icon = "⚡"
            else:
                color = Fore.WHITE
                icon = "▸"
            
            print(f"{icon} {color}Step {i}: {step_name}{Style.RESET_ALL}")
            
            # Show key details
            for key, value in step.items():
                if key not in ["step", "timestamp"] and value is not None:
                    if isinstance(value, (int, float, str, bool)):
                        print(f"    {Fore.YELLOW}{key}:{Style.RESET_ALL} {value}")
        
        # Display final result
        print(f"\n{Fore.CYAN}{'─' * 80}{Style.RESET_ALL}")
        print(f"{Fore.GREEN}{Style.BRIGHT}Final Result:{Style.RESET_ALL}\n")
        
        workflow_result = result.get("result", {})
        workflow_type = result.get("workflow_type", "unknown")
        
        # Display based on workflow type
        if workflow_type == "full_kyc_review":
            self._display_kyc_result(workflow_result)
        elif workflow_type == "risk_check":
            self._display_risk_result(workflow_result)
        elif workflow_type == "rag_summary":
            self._display_rag_result(workflow_result)
        
        # Show statistics
        print(f"\n{Fore.CYAN}{'─' * 80}{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}{Style.BRIGHT}Execution Statistics:{Style.RESET_ALL}")
        print(f"  Total Time: {result.get('total_execution_time', 0):.2f}s")
        print(f"  Workflow: {workflow_result.get('workflow', workflow_type)}")
        print(f"  Steps Executed: {len(result.get('execution_log', []))}")
        print(f"{Fore.CYAN}{'─' * 80}{Style.RESET_ALL}\n")
    
    def _display_kyc_result(self, result: Dict[str, Any]):
        """Display KYC review result"""
        risk = result.get("risk_assessment", {})
        
        print(f"{Fore.GREEN}✓ KYC Document Processed{Style.RESET_ALL}")
        print(f"{Fore.GREEN}✓ RAG Analysis Complete{Style.RESET_ALL}")
        print(f"{Fore.GREEN}✓ Risk Assessment: {risk.get('risk_level', 'N/A')} (Score: {risk.get('risk_score', 0)}/100){Style.RESET_ALL}")
        print(f"{Fore.GREEN}✓ Compliance Report Generated{Style.RESET_ALL}")
        
        print(f"\n{Fore.YELLOW}Final Decision:{Style.RESET_ALL} {result.get('final_decision', 'N/A')}")
    
    def _display_risk_result(self, result: Dict[str, Any]):
        """Display risk check result"""
        risk = result.get("risk_assessment", {})
        
        risk_level = risk.get("risk_level", "Unknown")
        risk_score = risk.get("risk_score", 0)
        
        # Color based on risk level
        if risk_level == "Low":
            level_color = Fore.GREEN
        elif risk_level == "Medium":
            level_color = Fore.YELLOW
        else:
            level_color = Fore.RED
        
        print(f"{Fore.CYAN}Client:{Style.RESET_ALL} {result.get('client_name', 'Unknown')}")
        print(f"{Fore.CYAN}Risk Level:{Style.RESET_ALL} {level_color}{risk_level}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}Risk Score:{Style.RESET_ALL} {risk_score}/100")
        print(f"\n{Fore.YELLOW}Analysis:{Style.RESET_ALL} {risk.get('analysis', 'N/A')}")
    
    def _display_rag_result(self, result: Dict[str, Any]):
        """Display RAG pipeline result"""
        rag = result.get("rag_pipeline", {})
        
        print(f"{Fore.CYAN}Documents Retrieved:{Style.RESET_ALL} {rag.get('documents_retrieved', 0)}")
        print(f"{Fore.CYAN}Documents Used:{Style.RESET_ALL} {rag.get('documents_used', 0)}")
        print(f"\n{Fore.YELLOW}Answer:{Style.RESET_ALL}")
        print(f"{rag.get('answer', 'No answer generated')}\n")
        
        # Show citations
        citations = rag.get("citations", [])
        if citations:
            print(f"{Fore.CYAN}Citations:{Style.RESET_ALL}")
            for i, cite in enumerate(citations, 1):
                print(f"  [{i}] {cite.get('title', 'Unknown')} (Score: {cite.get('score', 0):.2f})")
    
    def show_status(self):
        """Display system status"""
        status = self.orchestrator.get_status()
        
        print(f"\n{Fore.CYAN}{'=' * 80}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{Style.BRIGHT}System Status{Style.RESET_ALL}\n")
        
        print(f"{Fore.GREEN}Orchestrator:{Style.RESET_ALL} {status.get('status', 'unknown').upper()}")
        print(f"\n{Fore.YELLOW}Available Workflows:{Style.RESET_ALL}")
        for workflow in status.get("workflows_available", []):
            print(f"  • {workflow}")
        
        print(f"\n{Fore.YELLOW}Active Agents:{Style.RESET_ALL}")
        for agent_name, agent_status in status.get("agents", {}).items():
            print(f"  • {agent_name.title()}: {agent_status.get('status', 'unknown')}")
        
        print(f"\n{Fore.YELLOW}MCP Server:{Style.RESET_ALL}")
        mcp = status.get("mcp_server", {})
        print(f"  Status: {mcp.get('status', 'unknown').upper()}")
        print(f"  Tools: {mcp.get('tools_registered', 0)}")
        print(f"  Tool Names: {', '.join(mcp.get('tool_names', []))}")
        
        print(f"\n{Fore.CYAN}{'=' * 80}{Style.RESET_ALL}\n")
    
    async def run(self):
        """Main demo loop"""
        self.print_header()
        
        while True:
            self.print_menu()
            
            try:
                choice = input(f"{Fore.GREEN}Select scenario (0-5): {Style.RESET_ALL}").strip()
                
                if choice == "0":
                    print(f"\n{Fore.YELLOW}Thank you for viewing the demo!{Style.RESET_ALL}\n")
                    break
                elif choice == "1":
                    await self.run_scenario_1()
                elif choice == "2":
                    await self.run_scenario_2()
                elif choice == "3":
                    await self.run_scenario_3()
                elif choice == "4":
                    await self.run_custom_query()
                elif choice == "5":
                    self.show_status()
                else:
                    print(f"{Fore.RED}Invalid choice. Please select 0-5.{Style.RESET_ALL}")
                
                if choice in ["1", "2", "3", "4"]:
                    input(f"\n{Fore.CYAN}Press Enter to continue...{Style.RESET_ALL}")
                
            except KeyboardInterrupt:
                print(f"\n\n{Fore.YELLOW}Demo interrupted. Exiting...{Style.RESET_ALL}\n")
                break
            except Exception as e:
                print(f"\n{Fore.RED}Error: {e}{Style.RESET_ALL}\n")


async def main():
    """Entry point for demo runner"""
    runner = DemoRunner()
    await runner.run()


if __name__ == "__main__":
    print(f"{Fore.CYAN}Starting Multi-Agent + MCP Demo System...{Style.RESET_ALL}\n")
    asyncio.run(main())
