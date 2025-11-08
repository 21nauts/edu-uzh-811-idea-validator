# Startup Idea Validator

> **In 1 Hour: From Basecamp to Summit** 🏔️

A comprehensive AI-powered platform for entrepreneurs to validate startup ideas through market analysis, competitor research, and opportunity assessment.

## 🚀 Features

### ✅ **All Features Use Real AI APIs - NO Mock Data**

All 8 features connect to real APIs (Claude Sonnet 4.5, Perplexity Sonar) and save results to localStorage for persistence across sessions.

### Core Validation (Features 1-3)
- **Idea Validation**: AI-powered analysis using Claude and Perplexity
- **Market Analysis**: Real-time market research and competitive landscape
- **Scoring System**: 0-100 evaluation with detailed breakdown
- **Action Plans**: 48-hour execution roadmap
- **Data Persistence**: `localStorage.validated_ideas`

### Advanced Tools (Features 4-8)
- **TAM/SAM/SOM Calculator** (Feature 4): Market size estimation with industry/geography/segment filters
  - Persistence: `localStorage.tam_calculator_data`

- **Trend Radar** (Feature 5): Real-time monitoring of technology, consumer, regulatory, funding, and sentiment trends
  - Real-time Perplexity API integration

- **Industry Reports** (Feature 6): Comprehensive market reports with executive summaries and strategic recommendations
  - Persistence: `localStorage.industry_report_data`
  - Download as Markdown

- **Persona Builder** (Feature 7): AI-generated customer personas with demographics, pain points, and media consumption
  - Persistence: `localStorage.persona_builder_data`

- **Market Gap Finder** (Feature 8): Discover underserved market opportunities with scoring (70-90/100)
  - Persistence: `localStorage.gap_finder_data`

### Market Research Hub
- **Opportunity Heatmap**: SVG bubble chart visualization of validated ideas
- **AI Research Chat**: Interactive chat with Perplexity API
  - Persistence: `localStorage.market_research_chat`

**💾 Data Persistence**: Navigate away and come back - all your AI-generated data is preserved!

## 🎨 Design

Japanese-inspired minimalist design with glassmorphism:
- **Wabi-Sabi**: Authentic states and real data
- **Ma**: Generous negative space
- **Kanso**: Simplicity and clarity
- **Shibui**: Subtle, elegant animations

**Color Palette**:
- Primary: Mint (#7FE0C3)
- Background: Dark gradient (#1a1d23 to #2d3139)
- Glass effects with backdrop blur

## 🐳 Docker Quick Start

**All Docker files are in the root directory for easy deployment.**

### Production Mode

```bash
# Build and start (from root directory)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access at `http://localhost:3933`

### Development Mode (Hot Reload)

```bash
# Start with live code sync (from root directory)
docker-compose -f docker-compose.dev.yml up

# Stop
docker-compose -f docker-compose.dev.yml down
```

### Docker Commands

```bash
# Build images
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# View container stats
docker stats

# Execute shell in container
docker-compose exec app sh
```

See [Docker Setup Guide](docs/01-docker-setup.md) for complete documentation.

## 📦 Local Development (Without Docker)

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Navigate to app directory
cd app/startup-validator

# Install dependencies
npm install

# Start development server
PORT=3933 npm run dev
```

Access at `http://localhost:3933`

### Build for Production

```bash
# Create optimized build
npm run build

# Start production server
npm start
```

## 🔑 Configuration

### API Keys

Configure via Settings page (`/settings`):
1. **Perplexity API Key**: For market research and trend analysis
2. **Anthropic API Key**: For idea validation and scoring

Keys are stored in browser localStorage (client-side only).

### Current API Models (2025-11-06)
- Perplexity: `sonar` (lightweight, fast, cost-effective)
- Claude: `claude-sonnet-4-20250514`

## 📁 Project Structure

```
/
├── app/
│   └── startup-validator/        # Next.js application
│       ├── app/                  # App Router pages
│       │   ├── api/              # API routes (validate, market-research, etc.)
│       │   ├── home/             # Dashboard
│       │   ├── ideas/            # Idea validation (Features 1-3)
│       │   ├── market-research/  # Market research hub
│       │   ├── tam-calculator/   # Feature 4
│       │   ├── trend-radar/      # Feature 5
│       │   ├── industry-reports/ # Feature 6
│       │   ├── persona-builder/  # Feature 7
│       │   ├── gap-finder/       # Feature 8
│       │   ├── settings/         # API key config
│       │   └── login/            # Authentication
│       ├── components/           # Reusable components
│       │   ├── Sidebar.tsx       # Navigation
│       │   ├── CopyButton.tsx    # Clipboard utility
│       │   ├── MarkdownContent.tsx # Markdown renderer
│       │   └── ui/               # UI components
│       ├── next.config.ts        # Next.js config (standalone)
│       ├── tailwind.config.ts    # Tailwind CSS 3.x
│       ├── package.json          # Dependencies
│       └── README.md             # App-specific docs
├── docs/                         # Documentation
│   ├── 01-docker-setup.md        # Docker guide
│   ├── 02-plattform-build.md     # Feature specifications
│   ├── 03-design-guide.md        # Design system
│   └── 04-frontend-guide.md      # Technical implementation
├── Dockerfile                    # Multi-stage build (ROOT)
├── docker-compose.yml            # Production config (ROOT)
├── docker-compose.dev.yml        # Development config (ROOT)
├── .dockerignore                 # Docker ignore rules (ROOT)
├── CLAUDE.md                     # AI assistant config
└── README.md                     # This file
```

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.x
- **Icons**: Lucide React
- **Markdown**: react-markdown, remark-gfm, rehype-raw
- **Syntax Highlighting**: react-syntax-highlighter
- **Fonts**: Noto Sans JP, JetBrains Mono
- **Container**: Docker (multi-stage build)

## 📊 Features Detail

### Market Opportunity Heatmap

Visual bubble chart showing:
- **X-axis**: Competition Intensity
- **Y-axis**: Growth Rate
- **Bubble Size**: Market Size
- **Bubble Color**: Entry Difficulty (green=easy, blue=medium, pink=hard)

### Gap Finder Scoring

5 opportunities scored on:
- Market Size (25 points)
- Competition Level (20 points)
- Entry Barrier (15 points)
- Growth Potential (20 points)
- Strategic Fit (20 points)

Total: 100 points

### Industry Reports

Comprehensive reports include:
- Executive Summary
- Market Size & Growth Projections
- Key Players Analysis
- Customer Demographics
- Distribution Channels
- Pricing Strategies
- Success Stories
- Regulatory Environment
- Strategic Recommendations

Export formats: PDF, Excel, HTML (requires backend implementation)

## 🧪 Testing

### Responsive Viewports

Test on:
- Mobile: 375px
- Tablet: 768px
- Laptop: 1024px
- Desktop: 1920px

### Puppeteer Verification

```bash
# Use Puppeteer MCP to verify all pages
# Check for:
# - No console errors
# - All navigation works
# - Forms submit correctly
# - Loading states display
# - Responsive behavior
```

## 📝 Environment Variables

See `.env.example` in `/app` directory:

```env
NODE_ENV=production
PORT=3933
HOSTNAME=0.0.0.0
```

## 🐛 Troubleshooting

### Port Conflict

```bash
# Check what's using port 3933
lsof -i :3933

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Build Issues

```bash
# Clear Docker cache
docker builder prune -a

# Rebuild from scratch
docker-compose build --no-cache
```

### Hydration Errors

Hard refresh browser (Cmd+Shift+R) to clear cached hydration state.

## 📚 Documentation

- [Docker Setup Guide](docs/docker-setup.md) - Complete Docker documentation
- [Design Guide](docs/concept.md/03-design-guide.md) - UI/UX specifications
- [Build Guide](docs/concept.md/02-plattform-build.md) - Feature specifications
- [Frontend Guide](docs/concept.md/04-frontend-guide.md) - Technical implementation

## 🎓 Educational Context

This is an educational demonstration project (edu-uzh-811-test-3) designed to showcase:
- AI-powered validation workflows
- Japanese minimalist design principles
- Docker containerization best practices
- Modern Next.js architecture
- Multi-stage Docker builds

Built for live educational events with 5-10 prompt iterations.

## 📄 License

Educational demonstration project.

## 🙏 Acknowledgments

- Design inspired by Japanese minimalism (Wabi-Sabi, Ma, Kanso, Shibui)
- AI models: Anthropic Claude, Perplexity
- UI framework: Next.js, Tailwind CSS
