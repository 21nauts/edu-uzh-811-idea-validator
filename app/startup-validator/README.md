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

**Note**: All Docker files are located in the **root directory** (`../../`) for easy deployment.

### Production Mode

```bash
# Navigate to root directory
cd ../../

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access at `http://localhost:3933`

### Development Mode (Hot Reload)

```bash
# Navigate to root directory
cd ../../

# Start with live code sync
docker-compose -f docker-compose.dev.yml up

# Stop
docker-compose -f docker-compose.dev.yml down
```

### Docker Commands

```bash
# From root directory
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# View container stats
docker stats

# Execute shell in container
docker-compose exec app sh
```

## 📦 Local Development (Without Docker)

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
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

### Current API Models (2025-11-08)
- **Perplexity**: `sonar` (lightweight, fast, cost-effective)
- **Claude**: `claude-sonnet-4-20250514`

## 🧪 Testing

### Responsive Viewports
Test on:
- Mobile: 375px
- Tablet: 768px
- Laptop: 1024px
- Desktop: 1920px

## 🐛 Troubleshooting

### Port Conflict

```bash
# Check what's using port 3933
lsof -i :3933

# Kill process
kill -9 <PID>
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

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3.x
- **Icons**: Lucide React
- **Markdown**: react-markdown, remark-gfm, rehype-raw
- **Syntax Highlighting**: react-syntax-highlighter
- **Fonts**: Noto Sans JP, JetBrains Mono
- **Container**: Docker (multi-stage build)
- **AI APIs**: Anthropic Claude Sonnet 4.5, Perplexity Sonar

## 📄 License

Educational demonstration project.
