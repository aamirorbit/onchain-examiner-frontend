# Onchain Examiner Frontend

> A modern Next.js application providing an intuitive interface for AI-powered blockchain analysis with real-time chat interactions and comprehensive token insights.

---

## What's Integrated

This frontend delivers a seamless user experience for blockchain analysis featuring:

### **Modern UI Framework**
- **Next.js 14+** with App Router for optimal performance
- **React 18** with Server Components support
- **TypeScript** for type-safe development
- **Tailwind CSS** for responsive styling
- **shadcn/ui** component library for beautiful, accessible UI

### **Authentication System**
- **JWT-based Authentication** with secure token storage
- **Protected Routes** with automatic redirects
- **Auto-login** functionality on page refresh
- **Email Verification** workflow integration
- **Password Reset** flow support

### **Real-time Chat Interface**
- **Server-Sent Events (SSE)** for streaming AI responses
- **Live Typing Effect** for natural conversation flow
- **Message History** with context preservation
- **Quick Action Buttons** for common queries
- **Auto-scroll** to latest messages
- **Session Management** for conversation continuity

### **Token Analysis Dashboard**
- **Ethereum Address Validation** for input security
- **Real-time Analysis** with loading states
- **Interactive Results** display with AI insights
- **Analysis History** tracking per user
- **Session Resume** capability
- **Token Metrics** visualization

### **User Experience**
- **Responsive Design** for all device sizes
- **Toast Notifications** for user feedback
- **Loading States** and progress indicators
- **Error Handling** with helpful messages
- **Dark Mode** compatible design
- **Smooth Animations** and transitions

### **State Management**
- **React Context API** for global state
- **Custom Hooks** for reusable logic
- **LocalStorage** integration for persistence
- **Optimistic Updates** for better UX

---

## Prerequisites

Before running the frontend, ensure you have:

- **Node.js** >= 18.x
- **npm** or **yarn** package manager
- **Backend API** running (see backend README)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

> **Tip:** Make sure the backend API URL matches where your backend server is running.

### 3. Run the Application

**Development Mode** (with hot-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm run build
npm start
```

**Using the startup script** (starts both frontend and backend):
```bash
# From project root
./start.sh
```

**Application is running!** Open your browser at: `http://localhost:3001`

---

## Architecture Overview

```
onchain-examiner-frontend/
├── app/                      # Next.js app router
│   ├── page.tsx             # Home/landing page
│   ├── login/               # Authentication pages
│   ├── dashboard/           # Main application dashboard
│   ├── layout.tsx           # Root layout with providers
│   └── globals.css          # Global styles
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── auth/            # Login, register forms
│   │   ├── chat/            # Chat interface components
│   │   └── dashboard/       # Dashboard-specific components
│   ├── contexts/
│   │   └── auth.context.tsx # Authentication context provider
│   ├── hooks/
│   │   ├── useChat.ts       # Chat functionality hook
│   │   └── useAnalysis.ts   # Token analysis hook
│   ├── services/
│   │   ├── api.config.ts    # Axios configuration
│   │   ├── auth.service.ts  # Auth API calls
│   │   ├── chat.service.ts  # Chat & SSE handling
│   │   └── analysis.service.ts # Analysis API calls
│   └── types/               # TypeScript type definitions
└── lib/
    └── utils.ts             # Utility functions
```

---

## User Flow

1. **Login/Register** - Secure authentication with email/password
2. **Dashboard** - Main interface with session history sidebar
3. **Analyze Token** - Enter blockchain address to start analysis
4. **AI Chat** - Interactive conversation about token insights
5. **Session History** - Resume or review previous analyses

---

## Key Features

### Authentication
- Unified sign-in endpoint with automatic account creation
- JWT tokens with secure localStorage management
- Automatic session restoration on page refresh
- Protected route guards with login redirects

### Token Analysis
- Real-time Ethereum address validation
- Progressive loading states (5-30 seconds typical)
- Automatic chat session creation post-analysis
- Rich visualization of AI-generated insights

### Chat Interface
- Streaming responses via Server-Sent Events
- Natural typing animation effect
- Persistent conversation history
- Contextual quick-action suggestions
- Intelligent auto-scrolling behavior

### Session Management
- Visual sidebar with chronological session list
- One-click session restoration
- 24-hour session expiration handling
- Clean slate with new chat functionality

---

## UI Component Library

Built with production-ready **shadcn/ui** components:
- **Form Controls**: Button, Input, Textarea, Select
- **Layout**: Card, ScrollArea, Separator, Container
- **Feedback**: Toast (Sonner), Progress, Skeleton, Badge
- **Data Display**: Avatar, Table, Typography
- **Overlay**: Dialog, Popover, Tooltip

---

## API Service Layer

Clean separation of concerns with dedicated service modules:

- **auth.service.ts** - Login, register, token validation
- **analysis.service.ts** - Token analysis, history retrieval
- **chat.service.ts** - Message sending, SSE streaming
- **api.config.ts** - Axios interceptors, error handling, base config

---

## Configuration

### Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional (with defaults)
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

### Token Management

JWT tokens use localStorage with the following lifecycle:
- **Stored** on successful authentication
- **Attached** to all API requests via interceptor
- **Validated** on application initialization
- **Cleared** on logout or 401 responses

---

## Troubleshooting

### Network Connection Errors
- **Symptom**: "Network error occurred" messages
- **Solutions**:
  - Verify backend API is running on the correct port
  - Confirm `NEXT_PUBLIC_API_URL` matches backend address
  - Check browser console for CORS policy errors
  - Ensure firewall isn't blocking the connection

### Authentication Issues
- **Symptom**: "Unauthorized" or continuous logout
- **Solutions**:
  - Clear browser cache and localStorage
  - Check Dev Tools → Application → Local Storage for `auth_token`
  - Verify token hasn't expired (default: 7 days)
  - Try logging out completely and logging back in

### Chat Streaming Not Working
- **Symptom**: Messages don't appear or aren't streaming
- **Solutions**:
  - Confirm backend supports Server-Sent Events (SSE)
  - Check browser compatibility (Chrome, Firefox, Safari, Edge supported)
  - Look for JavaScript errors in browser console
  - Verify backend chat endpoint is accessible

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

---

## Deployment

### Vercel (Recommended for Next.js)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL` = your production backend URL
4. Click "Deploy"

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Other Platforms (Netlify, AWS, etc.)

```bash
# Build the application
npm run build

# Start production server
npm start
```

Set environment variable: `NEXT_PUBLIC_API_URL=<your-backend-url>`

---

## Development Tools

### Code Quality
```bash
npm run lint          # Run ESLint
npm run format        # Format with Prettier (if configured)
```

### Build Commands
```bash
npm run dev           # Development with hot reload
npm run build         # Production build
npm run start         # Start production server
```

---

## Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework | ^14.x |
| **React** | UI library | ^18.x |
| **TypeScript** | Type safety | ^5.x |
| **Tailwind CSS** | Styling | ^3.x |
| **shadcn/ui** | Component library | Latest |
| **Axios** | HTTP client | ^1.x |
| **Sonner** | Toast notifications | Latest |
| **Lucide React** | Icon library | Latest |

---

## Backend Integration

This frontend requires the Onchain Examiner backend. Key integration points:

- **Authentication**: `/api/auth/*` endpoints
- **Analysis**: `/api/analyze/*` endpoints  
- **Chat**: `/api/chat/*` endpoints with SSE support
- **History**: `/api/history/*` endpoints

Refer to the backend README for complete API documentation.

---

## Testing Addresses

Use these well-known token addresses for testing:

- **CAKE** (PancakeSwap): `0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82`
- **WBNB** (Wrapped BNB): `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c`
- **BUSD** (Binance USD): `0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56`
- **USDT** (Tether): `0x55d398326f99059fF775485246999027B3197955`

---

## Pro Tips

1. **Use the startup script** (`./start.sh` from root) to run both services together
2. **Open browser DevTools** (F12) to monitor API calls and debugging
3. **Check Network tab** for API request/response details
4. **Test with known tokens** before trying obscure addresses
5. **Clear localStorage** if experiencing persistent auth issues

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [React Hooks Reference](https://react.dev/reference/react)

---

## License

MIT License - feel free to use this project for learning and development.

---

**Built with ❤️ using Next.js, TypeScript, and shadcn/ui**
