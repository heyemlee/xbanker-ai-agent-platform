"""
Keyword Agent - Extracts keywords and entities from text

Part of RAG pipeline - runs in parallel with Embedding Agent.
Provides structured keyword matching for hybrid search.
"""

import time
import re
import logging
from typing import List, Dict, Any, Optional, Set
from collections import Counter

logger = logging.getLogger(__name__)


class KeywordAgent:
    """
    Agent 2: Keyword Agent
    
    Extracts keywords, entities, and important terms from text.
    Runs in PARALLEL with Embedding Agent for hybrid search.
    """
    
    AGENT_NAME = "Keyword Agent"
    AGENT_ROLE = "Keyword & Entity Extraction"
    
    # Common stop words to filter
    STOP_WORDS = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'been', 'be',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'this', 'that', 'these', 'those', 'it', 'its', 'their', 'them'
    }
    
    # Domain-specific keywords for compliance/KYC
    DOMAIN_KEYWORDS = {
        'risk': ['risk', 'high-risk', 'low-risk', 'medium-risk', 'risky'],
        'compliance': ['compliance', 'regulatory', 'sanctions', 'pep', 'aml', 'kyc'],
        'jurisdiction': ['jurisdiction', 'offshore', 'country', 'region'],
        'wealth': ['wealth', 'source of funds', 'assets', 'income', 'capital'],
        'transaction': ['transaction', 'transfer', 'payment', 'wire'],
        'business': ['business', 'company', 'corporate', 'entity', 'firm']
    }
    
    def __init__(self, use_llm: bool = False):
        """
        Initialize Keyword Agent
        
        Args:
            use_llm: If True, use LLM for advanced extraction; otherwise regex/rules
        """
        self.use_llm = use_llm
        self.execution_count = 0
        logger.info(f"Keyword Agent initialized (LLM mode: {use_llm})")
    
    def process(
        self,
        text: str,
        chunk_id: Optional[str] = None,
        max_keywords: int = 20
    ) -> Dict[str, Any]:
        """
        Extract keywords from text
        
        Args:
            text: Input text
            chunk_id: Optional chunk identifier
            max_keywords: Maximum number of keywords to extract
            
        Returns:
            Dict with extracted keywords and entities
        """
        start_time = time.time()
        self.execution_count += 1
        
        # Extract keywords
        if self.use_llm:
            keywords = self._extract_with_llm(text)
        else:
            keywords = self._extract_with_rules(text, max_keywords)
        
        # Extract entities (names, organizations, etc.)
        entities = self._extract_entities(text)
        
        # Categorize by domain
        domain_tags = self._categorize_domain(keywords)
        
        execution_time = time.time() - start_time
        
        return {
            "agent": self.AGENT_NAME,
            "role": self.AGENT_ROLE,
            "status": "success",
            "chunk_id": chunk_id or f"chunk_{self.execution_count}",
            "keywords": keywords,
            "entities": entities,
            "domain_tags": domain_tags,
            "keyword_count": len(keywords),
            "entity_count": len(entities),
            "metadata": {
                "execution_time_seconds": round(execution_time, 3),
                "execution_number": self.execution_count,
                "llm_mode": self.use_llm
            }
        }
    
    def process_batch(
        self,
        texts: List[str],
        chunk_ids: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Process multiple texts in batch for parallel processing
        
        Args:
            texts: List of texts
            chunk_ids: Optional chunk identifiers
            
        Returns:
            List of keyword extraction results
        """
        results = []
        for i, text in enumerate(texts):
            chunk_id = chunk_ids[i] if chunk_ids and i < len(chunk_ids) else None
            result = self.process(text, chunk_id)
            results.append(result)
        
        return results
    
    def _extract_with_rules(self, text: str, max_keywords: int) -> List[str]:
        """
        Extract keywords using regex and rule-based approach
        """
        # Convert to lowercase
        text_lower = text.lower()
        
        # Extract words (alphanumeric + hyphens)
        words = re.findall(r'\b[a-z][\w-]*\b', text_lower)
        
        # Filter stop words and short words
        filtered_words = [
            w for w in words 
            if w not in self.STOP_WORDS and len(w) > 2
        ]
        
        # Count frequency
        word_freq = Counter(filtered_words)
        
        # Get top keywords
        top_keywords = [word for word, count in word_freq.most_common(max_keywords)]
        
        return top_keywords
    
    def _extract_with_llm(self, text: str) -> List[str]:
        """
        Extract keywords using LLM (placeholder - would use real LLM)
        """
        # For demo, fall back to rules
        logger.info("LLM extraction not implemented, using rules")
        return self._extract_with_rules(text, max_keywords=20)
    
    def _extract_entities(self, text: str) -> List[Dict[str, str]]:
        """
        Extract named entities (names, organizations, locations)
        Using simple pattern matching for demo
        """
        entities = []
        
        # Extract capitalized phrases (potential names/orgs)
        # Pattern: 2-4 consecutive capitalized words
        pattern = r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b'
        matches = re.findall(pattern, text)
        
        for match in matches:
            # Simple heuristic: if contains common name patterns
            if any(title in match for title in ['Mr', 'Ms', 'Dr', 'Ltd', 'Inc', 'Corp']):
                entity_type = "organization" if any(suffix in match for suffix in ['Ltd', 'Inc', 'Corp']) else "person"
            else:
                entity_type = "unknown"
            
            entities.append({
                "text": match,
                "type": entity_type
            })
        
        # Remove duplicates
        seen = set()
        unique_entities = []
        for entity in entities:
            if entity["text"] not in seen:
                seen.add(entity["text"])
                unique_entities.append(entity)
        
        return unique_entities[:10]  # Limit to top 10
    
    def _categorize_domain(self, keywords: List[str]) -> List[str]:
        """
        Categorize keywords by domain (compliance, risk, etc.)
        """
        tags = set()
        
        keywords_lower = [k.lower() for k in keywords]
        
        for category, category_keywords in self.DOMAIN_KEYWORDS.items():
            if any(kw in keywords_lower for kw in category_keywords):
                tags.add(category)
        
        return list(tags)
    
    def get_status(self) -> Dict[str, Any]:
        """Get agent status"""
        return {
            "agent": self.AGENT_NAME,
            "status": "ready",
            "mode": "llm" if self.use_llm else "rules",
            "executions": self.execution_count
        }
    
    def __repr__(self) -> str:
        mode = "llm" if self.use_llm else "rules"
        return f"<KeywordAgent mode={mode} executions={self.execution_count}>"
