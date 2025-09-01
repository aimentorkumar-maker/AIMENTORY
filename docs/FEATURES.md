# PragyaAI-UPSC Features Documentation

## Phase 1: Core App Shell, Auth & UI Kit ✅

### Authentication System
- **Email/Password Authentication**: Secure login and signup with Supabase
- **Form Validation**: Zod schema validation for all forms
- **Password Reset**: Email-based password reset functionality
- **Session Management**: Persistent sessions with AsyncStorage
- **Protected Routes**: Automatic redirection for unauthenticated users

### UI Design System
- **Button Component**: Multiple variants (primary, secondary, outline, ghost, danger)
- **Input Component**: Form inputs with validation states and icons
- **Card Component**: Flexible card layouts with headers, content, and footers
- **Toggle Component**: Switch and checkbox toggles with labels

### Navigation Structure
- **Auth Routes**: `/login`, `/signup`, `/forgot-password`
- **Main App Routes**: `/home`, `/library`, `/profile`, `/settings`
- **Protected Route Guard**: Automatic auth state checking

### Database Schema
```sql
-- Users table (extends Supabase auth.users)
users:
  - id (UUID, references auth.users)
  - email (TEXT, unique)
  - created_at, updated_at

-- Profiles table
profiles:
  - id (UUID, primary key)
  - user_id (UUID, references users)
  - full_name (TEXT)
  - avatar_url (TEXT)
  - bio (TEXT)
  - subscription_tier (TEXT: free/premium/enterprise)
  - preferences (JSONB)
  - created_at, updated_at
```

### Security Features
- **Row Level Security (RLS)**: Database-level access control
- **User Isolation**: Users can only access their own data
- **Secure Authentication**: Supabase Auth with JWT tokens

## Phase 2: Notes System & Simplify Pipeline ✅

### Floating Notes ✅
- **FAB Integration**: Draggable floating action button across all screens
- **Note Creation**: Support for text, PDF, audio, and image input
- **Syllabus Mapping**: Link notes to specific UPSC syllabus nodes
- **Tagging System**: Organize notes with custom tags and categories
- **File Uploads**: Document picker, camera, and audio recording integration
- **Smart UI**: Expandable action menu with contextual options

### Simplify Pipeline ✅
- **Edge Function**: `simplify_notes` with Claude 3.5 Sonnet integration
- **LLM Processing**: AI-powered content simplification and enhancement
- **Multi-View Output**: Child-friendly explanations and exam-focused summaries
- **Citation Generation**: Automatic source attribution with confidence scoring
- **Mnemonic Creation**: AI-generated memory aids for key concepts
- **Key Points Extraction**: Automatic identification of important concepts

### Database Schema ✅
```sql
-- Notes table (implemented)
notes:
  - id (UUID), user_id (UUID), title (TEXT), content (TEXT)
  - syllabus_node_id (UUID, foreign key to syllabus_nodes)
  - tags (TEXT[]), note_type (ENUM), source_url, source_title
  - is_simplified (BOOLEAN), simplification_data (JSONB)
  - confidence_score (REAL), metadata (JSONB)
  - is_favorite, is_archived, created_at, updated_at

-- Note assets table (implemented)
note_assets:
  - id (UUID), note_id (UUID), file_name, file_url, file_type
  - file_size, mime_type, processing_status (ENUM)
  - ai_summary, extracted_text, ocr_confidence
  - metadata (JSONB), created_at, updated_at

-- Note citations table (implemented)
note_citations:
  - id (UUID), note_id (UUID), source_type (ENUM)
  - title, author, url, page_number, quote
  - publication_date, access_date, confidence_score
  - metadata (JSONB), created_at

-- Syllabus nodes table (implemented)
syllabus_nodes:
  - id (UUID), title, description, content, parent_id
  - level, order_index, difficulty_level, estimated_time_minutes
  - prerequisites (TEXT[]), learning_objectives (TEXT[])
  - tags (TEXT[]), metadata (JSONB), is_active
  - created_at, updated_at
```

### API Integration ✅
- **Notes CRUD**: Full create, read, update, delete operations
- **File Upload**: Supabase Storage integration for attachments
- **Search & Filter**: Text search and tag-based filtering
- **Favorite System**: User preference management
- **Archive System**: Soft delete with restore functionality

## Phase 3: Syllabus Graph & 3D Visualization (Planned)

### 3D Syllabus Explorer
- **Three.js Integration**: Interactive 3D globe visualization
- **Node Representation**: Syllabus topics as 3D nodes
- **Progress Tracking**: Visual progress indicators
- **Interactive Navigation**: Tap to explore topics

### Graph Database
```sql
-- Syllabus nodes
syllabus_nodes:
  - id, title, description, content
  - difficulty_level, estimated_time
  - prerequisites, learning_objectives

-- Graph edges
graph_edges:
  - id, from_node_id, to_node_id
  - relationship_type, weight
```

## Phase 4: Current Affairs & Signal Radar (Planned)

### CA Ingestion Pipeline
- **Automated Collection**: RSS feeds and web scraping
- **Source Verification**: Credibility scoring system
- **Topic Classification**: AI-powered content categorization
- **Provenance Tracking**: Source metadata and timestamps

### Signal Radar Engine
- **Heat Calculation**: Topic importance scoring
- **Ripple Detection**: Cross-topic relationship mapping
- **Forecast Generation**: Trend prediction algorithms
- **Visual Analytics**: Interactive heat maps and timelines

## Phase 5: Knowledge Graph & Semantic Search (Planned)

### Vector Embeddings
- **pgvector Integration**: PostgreSQL vector storage
- **Semantic Search**: AI-powered content discovery
- **Related Content**: Intelligent content recommendations
- **Mnemonic Suggestions**: Memory aid generation

### Knowledge Graph
```sql
-- Content items
content_items:
  - id, title, content, type
  - embeddings (vector)
  - metadata, tags

-- Knowledge links
knowledge_links:
  - id, from_item_id, to_item_id
  - relationship_type, confidence_score
```

## Phase 6: Hall Mode Simulator & Rubric Grader (Planned)

### Exam Simulator
- **Timed Sessions**: Realistic exam environment
- **Question Bank**: Dynamic question generation
- **Adaptive Difficulty**: Personalized question selection
- **Progress Tracking**: Detailed performance analytics

### AI Grader
- **Rubric-Based Scoring**: Structured evaluation criteria
- **Evidence Extraction**: Automatic answer analysis
- **Feedback Generation**: Detailed improvement suggestions
- **Confidence Scoring**: AI confidence in grading

## Phase 7: DAF Optimizer & Presence Trainer (Planned)

### DAF Processing
- **PII Redaction**: Automatic sensitive data removal
- **Question Bank Generation**: Interview question creation
- **Persona Summary**: AI-generated candidate profiles
- **Privacy Compliance**: GDPR and data protection

### Presence Analysis
- **Speech Metrics**: Pace, tone, filler word detection
- **Audio Processing**: Real-time voice analysis
- **Drill Generation**: Personalized improvement exercises
- **Progress Tracking**: Performance improvement metrics

## Phase 8: Mnemonics Pool & Collaboration (Planned)

### Mnemonics System
- **User Submissions**: Community mnemonic creation
- **Voting System**: Quality assessment mechanism
- **AI Scoring**: Automated memorability evaluation
- **Sharing Platform**: Community knowledge exchange

### Study Groups
- **Group Creation**: Collaborative study spaces
- **Real-time Chat**: Live communication features
- **Shared Resources**: Group note and resource sharing
- **Progress Syncing**: Group learning analytics

## Phase 9: Bilingual & Voice Features (Planned)

### Language Support
- **i18n Integration**: English and Hindi support
- **Translation Pipeline**: AI-powered content translation
- **Voice Commands**: Speech-to-text input
- **Text-to-Speech**: Audio content narration

### Accessibility
- **Dyslexia Support**: Specialized fonts and formatting
- **High Contrast**: Visual accessibility options
- **Voice Navigation**: Audio interface support
- **Large Touch Targets**: Mobile accessibility compliance

## Phase 10: Admin & Monetization (Planned)

### Admin Console
- **Feature Flags**: Dynamic feature control
- **User Management**: Admin user oversight
- **Analytics Dashboard**: Usage and performance metrics
- **Content Moderation**: Community content management

### Subscription System
- **Tier Management**: Free, Premium, Enterprise plans
- **Payment Integration**: Stripe/RevenueCat integration
- **Feature Gating**: Premium feature access control
- **Usage Analytics**: Subscription utilization tracking

## Technical Architecture

### Frontend Stack
- **React Native**: Cross-platform mobile development
- **Expo**: Development and deployment platform
- **NativeWind**: Tailwind CSS for React Native
- **Expo Router**: File-based navigation system

### Backend Stack
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Primary database
- **Edge Functions**: Serverless compute
- **Real-time**: Live data synchronization

### AI/ML Integration
- **OpenRouter**: LLM API integration
- **pgvector**: Vector similarity search
- **Custom Models**: Specialized UPSC content models
- **Embedding Pipeline**: Content vectorization

### Development Tools
- **TypeScript**: Type-safe development
- **ESLint**: Code quality enforcement
- **Jest**: Testing framework
- **GitHub Actions**: CI/CD pipeline

## Security & Privacy

### Data Protection
- **End-to-End Encryption**: Secure data transmission
- **PII Redaction**: Automatic sensitive data removal
- **Access Controls**: Role-based permissions
- **Audit Logging**: Comprehensive activity tracking

### Compliance
- **GDPR Compliance**: European data protection
- **Privacy by Design**: Built-in privacy features
- **Data Minimization**: Minimal data collection
- **User Consent**: Transparent data usage

## Performance & Scalability

### Optimization
- **Lazy Loading**: On-demand content loading
- **Caching Strategy**: Multi-level caching
- **Image Optimization**: Compressed media delivery
- **Bundle Splitting**: Efficient code distribution

### Monitoring
- **Error Tracking**: Sentry integration
- **Performance Metrics**: Real-time monitoring
- **User Analytics**: Usage pattern analysis
- **Health Checks**: System status monitoring
