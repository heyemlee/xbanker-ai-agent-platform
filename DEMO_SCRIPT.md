User Input (Client Name + KYC Documents)
    ↓
Agent Orchestrator (Coordinator)
    ↓
┌─────────────────────────────────────┐
│ Agent 1: KYC Analyst                │
│ - Extracts structured data from     │
│   unstructured text                 │
│ - Identifies wealth sources,        │
│   business activities, jurisdictions│
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Agent 2: Risk Assessor (RAG)        │
│ - Retrieves similar historical cases│
│ - Assesses risk based on context    │
│ - Uses RAG for intelligent decisions│
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Agent 3: Compliance Agent (Tools)   │
│ - Calls PEP database check tool     │
│ - Calls sanctions list check tool   │
│ - Synthesizes all info for final    │
│   decision                          │
└─────────────────────────────────────┘
    ↓
Final Decision + Complete Audit Trail
```

#### Input Sample Data:

```
Client Name: Alexandra Thompson

KYC Documents:
Client is a high-net-worth individual with diversified investment portfolio. 
Primary wealth generated from founding and selling two SaaS companies between 
2005-2018. Currently holds board positions in three technology startups based 
in London and San Francisco. Frequent international travel for business. 
Maintains banking relationships in UK, Monaco, and Switzerland. Clean background 
check completed. No adverse media findings. Source of wealth fully documented 
through tax returns and sale agreements. Some exposure to emerging markets through 
portfolio companies in Southeast Asia.
```