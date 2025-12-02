"""
MCP (Model Context Protocol) Server

Provides a standardized interface for AI agents to discover and call tools.
Implements the MCP protocol for tool registration, discovery, and execution.

For interview demo purposes - simplified MCP implementation.
"""

import json
import logging
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime

from tools.ocr_tool import OCRTool
from tools.risk_score_tool import RiskScoreTool
from tools.report_generator_tool import ReportGeneratorTool

logger = logging.getLogger(__name__)


class MCPServer:
    """
    MCP Server implementation
    
    Manages tool registration, discovery, and execution following the
    Model Context Protocol specification.
    """
    
    def __init__(self):
        """Initialize MCP server with tools"""
        self.tools: Dict[str, Any] = {}
        self.execution_log: List[Dict[str, Any]] = []
        
        # Register all available tools
        self._register_tools()
        
        logger.info(f"MCP Server initialized with {len(self.tools)} tools")
    
    def _register_tools(self):
        """Register all available tools"""
        # Initialize tool instances
        ocr_tool = OCRTool()
        risk_tool = RiskScoreTool()
        report_tool = ReportGeneratorTool()
        
        # Register tools
        self.register_tool(
            name=ocr_tool.TOOL_NAME,
            tool_instance=ocr_tool,
            schema=ocr_tool.get_schema(),
            execute_fn=ocr_tool.execute
        )
        
        self.register_tool(
            name=risk_tool.TOOL_NAME,
            tool_instance=risk_tool,
            schema=risk_tool.get_schema(),
            execute_fn=risk_tool.execute
        )
        
        self.register_tool(
            name=report_tool.TOOL_NAME,
            tool_instance=report_tool,
            schema=report_tool.get_schema(),
            execute_fn=report_tool.execute
        )
    
    def register_tool(
        self,
        name: str,
        tool_instance: Any,
        schema: Dict[str, Any],
        execute_fn: Callable
    ):
        """
        Register a tool with the MCP server
        
        Args:
            name: Unique tool name
            tool_instance: Tool instance
            schema: Tool schema (MCP format)
            execute_fn: Function to execute the tool
        """
        self.tools[name] = {
            "instance": tool_instance,
            "schema": schema,
            "execute": execute_fn,
            "registered_at": datetime.now().isoformat()
        }
        logger.info(f"Registered tool: {name}")
    
    def list_tools(self) -> List[Dict[str, Any]]:
        """
        List all available tools (MCP discovery)
        
        Returns:
            List of tool schemas
        """
        return [
            {
                "name": name,
                "schema": tool_data["schema"],
                "registered_at": tool_data["registered_at"]
            }
            for name, tool_data in self.tools.items()
        ]
    
    def get_tool_schema(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """
        Get schema for a specific tool
        
        Args:
            tool_name: Name of the tool
            
        Returns:
            Tool schema or None if not found
        """
        tool_data = self.tools.get(tool_name)
        return tool_data["schema"] if tool_data else None
    
    def execute_tool(
        self,
        tool_name: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a tool with given parameters
        
        Args:
            tool_name: Name of tool to execute
            parameters: Tool parameters
            
        Returns:
            Tool execution result
        """
        start_time = datetime.now()
        
        # Check if tool exists
        if tool_name not in self.tools:
            return {
                "status": "error",
                "error": f"Tool '{tool_name}' not found",
                "available_tools": list(self.tools.keys())
            }
        
        try:
            # Get tool
            tool_data = self.tools[tool_name]
            execute_fn = tool_data["execute"]
            
            # Execute tool
            logger.info(f"Executing tool: {tool_name} with params: {list(parameters.keys())}")
            result = execute_fn(**parameters)
            
            # Log execution
            execution_record = {
                "tool_name": tool_name,
                "parameters": parameters,
                "result_status": result.get("status", "unknown"),
                "timestamp": start_time.isoformat(),
                "execution_time": (datetime.now() - start_time).total_seconds()
            }
            self.execution_log.append(execution_record)
            
            return result
            
        except Exception as e:
            logger.error(f"Tool execution error: {e}")
            return {
                "status": "error",
                "tool": tool_name,
                "error": str(e),
                "error_type": type(e).__name__
            }
    
    def get_execution_log(self) -> List[Dict[str, Any]]:
        """
        Get execution log for all tool calls
        
        Returns:
            List of execution records
        """
        return self.execution_log
    
    def get_server_info(self) -> Dict[str, Any]:
        """
        Get MCP server information
        
        Returns:
            Server metadata
        """
        return {
            "server": "MCP Demo Server",
            "version": "1.0.0",
            "protocol": "Model Context Protocol (MCP)",
            "tools_registered": len(self.tools),
            "tool_names": list(self.tools.keys()),
            "total_executions": len(self.execution_log),
            "status": "ready"
        }
    
    def __repr__(self) -> str:
        return f"<MCPServer tools={len(self.tools)} executions={len(self.execution_log)}>"


# Global MCP server instance
mcp_server = MCPServer()


def get_mcp_server() -> MCPServer:
    """Get global MCP server instance"""
    return mcp_server
