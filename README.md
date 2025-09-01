# PragyaAI-UPSC 🎯

An advanced, AI-powered mobile application designed specifically for UPSC (Union Public Service Commission) exam preparation. This comprehensive platform combines cutting-edge technology with proven study methodologies to create the ultimate learning experience for civil service aspirants.

## 🚀 Features

### Phase 1: Core Foundation ✅
- **Authentication System**: Secure email/password login with Supabase
- **Beautiful UI**: Modern design system with NativeWind and custom components
- **User Profiles**: Personalized user experience with subscription tiers
- **Responsive Design**: Optimized for all mobile devices

### Upcoming Phases
- **AI-Powered Notes**: Intelligent note-taking with automatic summarization
- **3D Syllabus Explorer**: Interactive 3D visualization of UPSC syllabus
- **Current Affairs Radar**: Real-time news analysis and trend detection
- **Hall Mode Simulator**: Realistic exam environment simulation
- **Voice & Bilingual Support**: Multi-language and accessibility features

## 🛠 Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development and deployment platform
- **NativeWind** - Tailwind CSS for React Native
- **Expo Router** - File-based navigation system
- **TypeScript** - Type-safe development

### Backend
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Primary database with Row Level Security
- **Edge Functions** - Serverless compute for AI features
- **Real-time** - Live data synchronization

### AI/ML
- **OpenRouter** - LLM API integration
- **pgvector** - Vector similarity search
- **Custom Models** - Specialized UPSC content processing

## 📱 Screenshots

*Screenshots will be added as development progresses*

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pragyaai-upsc.git
   cd pragyaai-upsc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator

## 🗄 Database Setup

### Supabase Configuration

1. **Create a new Supabase project**
2. **Run the migration**
   ```sql
   -- Copy and run the contents of supabase/migrations/001_create_users_and_profiles.sql
   ```
3. **Configure Row Level Security (RLS)**
4. **Set up authentication providers**

### Local Development

For local development with Supabase:
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# E2E tests (when implemented)
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 📦 Project Structure

```
pragyaai-upsc/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   └── (tabs)/            # Main app screens
│       ├── index.tsx      # Home screen
│       ├── library.tsx    # Library screen
│       └── profile.tsx    # Profile screen
├── packages/              # Monorepo packages
│   ├── ui/               # UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Toggle.tsx
│   └── api/              # API client and hooks
│       ├── supabase.ts
│       └── auth.ts
├── supabase/             # Database migrations
│   └── migrations/
├── docs/                 # Documentation
│   └── FEATURES.md
├── assets/              # Static assets
└── components/          # Shared components
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web

# Testing
npm test           # Run tests
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript check

# Building
npm run build      # Build for production
npm run eject      # Eject from Expo
```

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Conventional Commits** for commit messages

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add new feature"`
3. Push and create PR: `git push origin feature/your-feature`

## 🚀 Deployment

### Expo Application Services (EAS)

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for production
eas build --platform all

# Submit to stores
eas submit --platform all
```

### Environment Variables

Set up environment variables in EAS:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "your-url"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-key"
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Phases

1. **Phase 1**: Core app shell, auth, UI kit ✅
2. **Phase 2**: Notes system & simplify pipeline
3. **Phase 3**: Syllabus graph & 3D visualization
4. **Phase 4**: Current affairs & signal radar
5. **Phase 5**: Knowledge graph & semantic search
6. **Phase 6**: Hall mode simulator & rubric grader
7. **Phase 7**: DAF optimizer & presence trainer
8. **Phase 8**: Mnemonics pool & collaboration
9. **Phase 9**: Bilingual & voice features
10. **Phase 10**: Admin & monetization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/FEATURES.md](docs/FEATURES.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/pragyaai-upsc/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/pragyaai-upsc/discussions)

## 🙏 Acknowledgments

- **UPSC Community** for feedback and suggestions
- **Expo Team** for the amazing development platform
- **Supabase Team** for the powerful backend solution
- **Open Source Community** for the incredible tools and libraries

---

**Made with ❤️ for UPSC aspirants**
