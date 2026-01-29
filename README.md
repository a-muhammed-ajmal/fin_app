# Life OS - Personal Finance & Productivity App

A comprehensive financial management platform with AI-driven insights, task tracking, and life planning features.

## Features

### 💰 Financial Management
- **Income Engine**: Track income sources, gap analysis, and growth strategies
- **Spending Engine**: Budget management with needs vs. wants analysis
- **Investment Manager**: Portfolio tracking with risk profiling
- **Loan Manager**: Debt analysis, affordability checks, and repayment strategies
- **Tax Manager**: Tax regime optimization and filing calendar
- **Insurance Manager**: Policy tracking and coverage analysis
- **Savings Engine**: Emergency fund targeting and SIP management
- **Financial Tools**: Document vault and readiness audit

### ✅ Productivity
- **Task Manager**: Priority-based task tracking with categories
- **Habit Tracker**: Build consistent habits with streak tracking
- **Vision Board**: Goal setting and life planning
- **CRM**: Contact and relationship management

### 🤖 AI Integration
- **AI Assistant**: Life OS Assistant powered by Google Gemini
- AI-driven insights on financial health and life balance

### 📊 Data Management
- **Data Persistence**: Supabase integration for cloud sync
- **Export/Import**: JSON backup and CSV transaction export
- **Financial Reports**: Generate comprehensive financial summaries

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Fill in your `.env` file:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Run locally:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Architecture

### Tech Stack
- React 19 + TypeScript
- Tailwind CSS
- Recharts for visualizations
- Supabase for backend
- Google Gemini API

### Best Practices
- ✅ Full TypeScript strict mode
- ✅ Error boundaries and validation
- ✅ Memoized calculations
- ✅ Reusable custom hooks
- ✅ Data export functionality

## Contributing

Feel free to submit issues and enhancements!
