# xBanker AI Agent Suite MVP

**Intelligent Automation for Private Banks & External Asset Managers**

A full-stack web application showcasing AI-powered KYC workflows, dynamic risk surveillance, and client 360 insights for private banking and wealth management institutions.

---

## 🎯 Overview

xBanker addresses critical pain points in private banking:
- Manual KYC verification and compliance monitoring
- Fragmented data across systems
- Slow client onboarding
- High operational costs and error risk

The MVP demonstrates three core modules:
1. **KYC Workflow Automation** - AI-powered document analysis and risk assessment
2. **Dynamic Risk Surveillance** - Real-time activity monitoring and risk detection
3. **Client 360 Insights** - AI-generated summaries for relationship managers

---

## 🏗️ Technology Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database:** SQLite (PostgreSQL-compatible schema)
- **ORM:** SQLAlchemy 2.0
- **AI/ML:** OpenAI API (GPT-4 or GPT-3.5-turbo)
- **Validation:** Pydantic v2

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI Library:** React 18
- **Styling:** Tailwind CSS v3

---

## 📁 Project Structure

```
xbanker.ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Configuration management
│   │   ├── database.py          # Database setup
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── client.py
│   │   │   └── risk_alert.py
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── client.py
│   │   │   ├── risk.py
│   │   │   └── insights.py
│   │   ├── api/                 # API endpoints
│   │   │   ├── kyc.py
│   │   │   ├── risk.py
│   │   │   ├── clients.py
│   │   │   └── dashboard.py
│   │   └── services/
│   │       └── llm_service.py   # OpenAI integration
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── app/
    │   ├── layout.tsx           # Root layout
    │   ├── page.tsx             # Dashboard
    │   ├── kyc/page.tsx         # KYC Workflows
    │   ├── risk/page.tsx        # Risk Surveillance
    │   └── clients/[id]/page.tsx # Client Detail
    ├── components/
    │   ├── Navigation.tsx
    │   ├── StatCard.tsx
    │   └── ui/
    │       ├── Badge.tsx
    │       └── Card.tsx
    ├── lib/
    │   └── api.ts               # API client
    ├── types/
    │   └── index.ts             # TypeScript types
    ├── package.json
    └── .env.local.example
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher
- OpenAI API key (optional - app works in mock mode without it)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key (optional)
   ```

5. **Run the backend:**
   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`
   - Alternative Docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment (optional):**
   ```bash
   cp .env.local.example .env.local
   # Edit if your backend runs on a different port
   ```

4. **Run the frontend:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

---

## 🎬 Demo Flow (10-15 minutes)

### Part 1: Dashboard & Overview (2 min)
1. Open `http://localhost:3000`
2. Highlight the dashboard statistics
3. Explain the three core modules and key benefits

### Part 2: KYC Workflow Automation (4 min)
1. Navigate to "KYC Workflows"
2. Use this sample data:

**Sample Client:**
```
Full Name: Alexandra Thompson
Date of Birth: 1978-05-20
Nationality: United Kingdom
Residency: Monaco
Source of Wealth: Technology investments and consulting
Business Activity: Private equity investor

KYC Notes:
Client is a high-net-worth individual with diversified investment portfolio. 
Primary wealth generated from founding and selling two SaaS companies between 
2005-2018. Currently holds board positions in three technology startups based 
in London and San Francisco. Frequent international travel for business. 
Maintains banking relationships in UK, Monaco, and Switzerland. Clean background 
check completed. No adverse media findings. Source of wealth fully documented 
through tax returns and sale agreements. Some exposure to emerging markets through 
portfolio companies in Southeast Asia.
```

3. Click "Run KYC Analysis"
4. Show the AI-generated risk assessment, flags, and KYC summary
5. Click "View Full Client Profile"

### Part 3: Dynamic Risk Surveillance (4 min)
1. Navigate to "Risk Surveillance"
2. Select the client you just created (Alexandra Thompson)
3. Use this sample activity log:

```
Client opened three new accounts in Singapore and Hong Kong in the past 14 days. 
Unusual transaction pattern detected: 12 wire transfers totaling USD 2.3M sent to 
newly established entities in British Virgin Islands. Transactions flagged as 
outside normal pattern - client typically maintains 3-4 transactions per month 
averaging USD 150K. Recent news article mentions client's former business partner 
is under investigation by UK tax authorities for offshore tax evasion scheme. 
Client has not responded to routine compliance questionnaire sent 30 days ago.
```

4. Click "Analyze Risk"
5. Show the severity level, risk tags, summary, and recommended actions
6. Scroll down to see the alert added to recent alerts list

### Part 4: Client 360 Insights (3 min)
1. Navigate back to the client profile (from KYC page or via URL)
2. Scroll to "Client 360 Insights" section
3. Click "Generate Insights"
4. Review the AI-generated:
   - Profile Overview
   - Risk & Compliance View
   - Suggested RM Actions
   - Next Best Actions

### Part 5: Wrap-up (2 min)
1. Return to dashboard to show updated statistics
2. Emphasize key value propositions:
   - Automation reduces manual work by 70%
   - AI enables faster, more accurate risk assessment
   - Unified platform improves compliance and client service
   - Scalable architecture ready for production deployment

---

## 🔑 Environment Variables

### Backend (.env)
```bash
# OpenAI Configuration
OPENAI_API_KEY=your-api-key-here    # Leave empty for mock mode
OPENAI_MODEL=gpt-4                  # or gpt-3.5-turbo

# Database
DATABASE_URL=sqlite:///./xbanker.db

# CORS (for frontend)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# App Settings
APP_NAME=xBanker AI Agent Suite
DEBUG=True
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🧪 Testing & Verification

### Backend API Testing

Test endpoints with curl:

```bash
# Health check
curl http://localhost:8000/health

# Get dashboard stats
curl http://localhost:8000/api/dashboard/stats

# Analyze KYC (POST)
curl -X POST http://localhost:8000/api/kyc/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Client",
    "kyc_notes": "Sample client with verified background."
  }'

# Get clients
curl http://localhost:8000/api/kyc/clients

# Get client by ID
curl http://localhost:8000/api/kyc/clients/1
```

### Frontend Testing
1. Navigate through all pages
2. Submit forms with sample data
3. Verify API responses display correctly
4. Check responsive design on different screen sizes

---

## 🎨 Design Principles

### Visual Design
- **Professional & Clean:** Neutral color palette (navy blue primary, grays)
- **Financial Sector Appropriate:** No playful elements, corporate aesthetic
- **Clear Information Hierarchy:** Card-based layout, consistent typography
- **Accessible:** High contrast, readable fonts, clear CTAs

### UX Principles
- **Task-Oriented:** Each page maps to a specific workflow
- **Progressive Disclosure:** Show results after actions
- **Minimal Friction:** Simple forms, clear labeling
- **Feedback:** Loading states, error messages, success confirmations

---

## 🤖 LLM Integration Details

### Mock Mode (No API Key)
If `OPENAI_API_KEY` is not configured, the app runs in **mock mode** with realistic placeholder responses. Perfect for:
- Demos without API costs
- Development without API access
- Testing UI without external dependencies

### Production Mode (With API Key)
When configured, the app uses structured prompts to ensure:
- Consistent JSON responses
- Reliable parsing
- Appropriate risk assessments
- Professional compliance language

### Prompt Design
Each module uses specialized system prompts:
- **KYC Analysis:** Acts as compliance analyst, extracts structured data
- **Risk Surveillance:** Acts as risk officer, identifies signals and severity
- **Client Insights:** Acts as RM advisor, generates actionable recommendations

---

## 📊 Data Models

### Client
```
id, full_name, date_of_birth, nationality, residency_country,
source_of_wealth, business_activity, pep_flag, sanctions_flag,
risk_score, risk_rationale, kyc_summary, raw_kyc_notes,
created_at, updated_at
```

### RiskAlert
```
id, client_id, severity, risk_tags, summary, next_steps,
raw_activity_log, created_at
```

---

## 🔐 Security Considerations (Production Roadmap)

This MVP focuses on functionality. For production deployment, implement:

- [ ] User authentication and authorization
- [ ] Role-based access control (RBAC)
- [ ] Audit logging for all actions
- [ ] Data encryption at rest and in transit
- [ ] API rate limiting
- [ ] Input sanitization and validation
- [ ] HTTPS/TLS configuration
- [ ] Secure secrets management (not in .env files)
- [ ] Database backups and disaster recovery

---

## 🎯 Interview Talking Points

### Technical Architecture
- **Microservices-ready:** Backend API is independent and scalable
- **Modern Stack:** Latest versions of FastAPI and Next.js
- **Type Safety:** Pydantic (backend) and TypeScript (frontend)
- **API-First:** RESTful design with OpenAPI docs

### Scalability
- SQLAlchemy ORM makes database migration trivial (SQLite → PostgreSQL)
- Stateless API enables horizontal scaling
- Frontend can be deployed to CDN (Vercel, Cloudflare)
- LLM service can be swapped or scaled independently

### Business Alignment
- Each feature maps directly to xBanker's marketing value props
- UI/UX designed for target users (compliance officers, RMs, risk teams)
- Demonstrates AI as augmentation, not replacement
- Addresses real pain points in private banking

### Next Steps (If Asked)
- Multi-tenancy for multiple institutions
- Advanced analytics and reporting
- Integration with external data sources (sanctions lists, news APIs)
- Workflow automation (approvals, escalations)
- Mobile application
- White-labeling capabilities

---

## 🐛 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.11+)
- Verify virtual environment is activated
- Try: `pip install --upgrade pip` then reinstall requirements

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Delete `node_modules` and `.next`, run `npm install` again
- Check for port conflicts (3000)

### API calls fail from frontend
- Verify backend is running on port 8000
- Check CORS configuration in backend
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Open browser console to see exact error

### LLM responses are placeholders
- This is expected if no `OPENAI_API_KEY` is set (mock mode)
- To use real AI, add valid OpenAI API key to backend `.env`
- Restart backend after adding API key

---

## 📝 License

This project is created as an MVP demonstration for interview purposes.

---

## 👥 Contact

For questions or demo scheduling, contact the xBanker team.

---

**Built with ❤️ for xBanker - Transforming Private Banking with AI**
