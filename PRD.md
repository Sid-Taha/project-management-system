# Product Requirements Document (PRD) v2.0
## Project Camp - AI-Enabled Project Management Platform

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | January 2026 | System Architect | Complete production-ready specification with AI integration |
| 1.0 | December 2025 | Initial Team | Basic feature specification |

**Document Status**: Production Ready  
**Target Launch**: Q2 2026  
**Classification**: Internal Use

---

# 1. EXECUTIVE SUMMARY

## 1.1 Product Vision

Project Camp is a next-generation, AI-powered project management platform designed to revolutionize how teams collaborate, plan, and execute projects. Unlike traditional project management tools (Jira, ClickUp, Asana), Project Camp provides each user with an intelligent AI assistant that proactively helps with task management, risk assessment, smart scheduling, and team optimization.

## 1.2 Mission Statement

To eliminate project management complexity by providing intelligent, automated assistance that allows teams to focus on execution rather than administration.

## 1.3 Key Differentiators

1. **Personal AI Assistant**: Every user gets a dedicated AI agent trained on their work patterns
2. **Predictive Analytics**: AI-powered risk detection and timeline forecasting
3. **Smart Automation**: Intelligent task assignments, priority suggestions, and workload balancing
4. **Context-Aware Insights**: Real-time recommendations based on project health and team dynamics
5. **Scalable Architecture**: Built to handle 100K+ concurrent users from day one

## 1.4 Target Market

### Primary Users
- **Startups & Scale-ups** (5-200 employees): Need affordable, scalable PM tools
- **Digital Agencies**: Manage multiple client projects simultaneously  
- **Remote-First Companies**: Require robust async collaboration
- **Software Development Teams**: Need technical task tracking with AI assistance

### Market Size
- TAM: $6.1B (Global Project Management Software Market, 2026)
- SAM: $1.8B (SMB + Enterprise AI-enabled PM tools)
- SOM: $45M (Target 0.7% market share by Year 2)

## 1.5 Success Metrics (Year 1)

| Metric | Target | Rationale |
|--------|--------|-----------|
| Monthly Active Users | 10,000 | Product-market fit indicator |
| User Retention (90-day) | 40% | Industry benchmark for SaaS |
| AI Interaction Rate | 60% | Users engaging with AI weekly |
| Average Session Duration | 18 minutes | Deep engagement signal |
| NPS Score | 45+ | Strong product satisfaction |
| Revenue (ARR) | $500K | Sustainability milestone |

---

# 2. PRODUCT ARCHITECTURE

## 2.1 Technology Stack

### Backend
```
Runtime: Node.js 20.x LTS
Framework: Express.js 5.x
Language: JavaScript (ES Modules)
Architecture Pattern: MVC with Service Layer
```

### Database Layer
```
Primary Database: MongoDB 7.x (Atlas Cluster M10+)
  - Document-based for flexible schema
  - Built-in replication and sharding
  - Geographically distributed read replicas

Cache Layer: Redis 7.x (Upstash/ElastiCache)
  - Session management
  - API response caching (TTL: 5-300 seconds)
  - Rate limiting counters
  - Real-time leaderboards

Search Engine: MongoDB Atlas Search (Lucene-based)
  - Full-text search across projects, tasks, notes
  - Fuzzy matching and relevance scoring
```

### AI/ML Infrastructure
```
Primary LLM: OpenAI GPT-4 Turbo (128K context)
  - Task generation and suggestions
  - Natural language query processing
  - Risk analysis and forecasting

Embedding Model: text-embedding-3-large
  - Semantic search across project content
  - Similar task/project recommendations

Vector Database: MongoDB Atlas Vector Search
  - Store embeddings for semantic operations
  - Sub-100ms query latency
```

### File Storage
```
Production: AWS S3 (Multi-region replication)
  - Task attachments (max 50MB per file)
  - User avatars
  - Project documents
  
CDN: CloudFlare (Global edge network)
  - Static asset delivery
  - Image optimization and transformation
  - DDoS protection
```

### Real-time Communication
```
WebSocket Layer: Socket.io 4.x
  - Real-time task updates
  - Live AI assistant chat
  - Collaborative editing notifications
  - Online user presence

Message Queue: BullMQ (Redis-backed)
  - Asynchronous email sending
  - AI processing jobs
  - Scheduled notifications
  - Webhook delivery
```

### Monitoring & Observability
```
Error Tracking: Sentry
  - Real-time error alerts
  - Performance monitoring
  - Release tracking

Logging: Winston + CloudWatch/Logtail
  - Structured JSON logs
  - Log levels: error, warn, info, debug
  - Log retention: 90 days

Metrics: Prometheus + Grafana
  - API response times
  - Database query performance
  - Cache hit rates
  - AI API latency

Uptime Monitoring: UptimeRobot/Better Uptime
  - 1-minute interval checks
  - Multi-region monitoring
  - Status page for customers
```

## 2.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  Web App (React) │ Mobile App (React Native) │ Desktop (Electron) │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────▼────────┐
    │   CloudFlare    │ (CDN, DDoS Protection, SSL)
    │   Load Balancer │
    └────────┬────────┘
             │
    ┌────────▼────────────────────────────────────┐
    │         Nginx Reverse Proxy                 │
    │  - Rate Limiting                            │
    │  - SSL Termination                          │
    │  - Request Routing                          │
    └────────┬────────────────────────────────────┘
             │
    ┌────────▼────────────────────────────────────┐
    │      Application Servers (Auto-scaled)      │
    │  ┌─────────────────────────────────────┐   │
    │  │  Express.js API (PM2 Cluster Mode)  │   │
    │  │  - Authentication Middleware        │   │
    │  │  - Permission Validation            │   │
    │  │  - Request Logging                  │   │
    │  └─────────────────────────────────────┘   │
    └─────┬──────────────────┬────────────────────┘
          │                  │
    ┌─────▼──────┐    ┌─────▼──────────┐
    │   Redis    │    │  MongoDB Atlas │
    │   Cache    │    │  Primary DB    │
    │            │    │  + Replicas    │
    └────────────┘    └────────────────┘
          │
    ┌─────▼──────────────────┐
    │   Background Jobs      │
    │  (BullMQ Workers)      │
    │  - Email Queue         │
    │  - AI Processing       │
    │  - Report Generation   │
    └────────────────────────┘
          │
    ┌─────▼──────────────────┐
    │   External Services    │
    │  - OpenAI API          │
    │  - SendGrid (Email)    │
    │  - AWS S3 (Storage)    │
    │  - Sentry (Monitoring) │
    └────────────────────────┘
```

## 2.3 Database Schema Design

### Collections Overview

```javascript
// Users Collection
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  fullName: String,
  password: String (bcrypt hashed),
  avatar: {
    url: String,
    localPath: String
  },
  isEmailVerified: Boolean,
  refreshToken: String,
  emailVerificationToken: String (indexed),
  emailVerificationExpiry: Date,
  forgotPasswordToken: String (indexed),
  forgotPasswordExpiry: Date,
  preferences: {
    theme: String, // 'light' | 'dark'
    notifications: {
      email: Boolean,
      push: Boolean,
      slack: Boolean
    },
    aiSettings: {
      autoSuggest: Boolean,
      analysisFrequency: String // 'daily' | 'weekly' | 'never'
    }
  },
  subscription: {
    plan: String, // 'free' | 'pro' | 'enterprise'
    status: String, // 'active' | 'cancelled' | 'past_due'
    currentPeriodEnd: Date
  },
  aiConversationHistory: [{
    role: String, // 'user' | 'assistant'
    content: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}

// Projects Collection
{
  _id: ObjectId,
  name: String (unique, indexed),
  description: String,
  createdBy: ObjectId (ref: User, indexed),
  settings: {
    visibility: String, // 'private' | 'team' | 'public'
    defaultTaskStatus: String,
    allowGuestAccess: Boolean
  },
  metadata: {
    totalTasks: Number,
    completedTasks: Number,
    totalMembers: Number,
    lastActivityAt: Date
  },
  aiInsights: {
    riskLevel: String, // 'low' | 'medium' | 'high'
    healthScore: Number, // 0-100
    lastAnalyzedAt: Date,
    recommendations: [String]
  },
  isArchived: Boolean,
  archivedAt: Date,
  createdAt: Date (indexed),
  updatedAt: Date
}

// ProjectMembers Collection (Junction Table)
{
  _id: ObjectId,
  user: ObjectId (ref: User, indexed),
  project: ObjectId (ref: Project, indexed),
  role: String, // 'admin' | 'project_admin' | 'member'
  joinedAt: Date,
  invitedBy: ObjectId (ref: User),
  permissions: {
    canCreateTasks: Boolean,
    canDeleteTasks: Boolean,
    canManageMembers: Boolean,
    canViewReports: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
// Compound Index: { project: 1, user: 1 } UNIQUE

// Tasks Collection
{
  _id: ObjectId,
  title: String (text indexed),
  description: String (text indexed),
  project: ObjectId (ref: Project, indexed),
  assignedTo: ObjectId (ref: User, indexed),
  assignedBy: ObjectId (ref: User),
  status: String (indexed), // 'todo' | 'in_progress' | 'done'
  priority: String (indexed), // 'low' | 'medium' | 'high' | 'critical'
  dueDate: Date (indexed),
  estimatedHours: Number,
  actualHours: Number,
  tags: [String] (indexed),
  attachments: [{
    url: String,
    filename: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date,
    uploadedBy: ObjectId (ref: User)
  }],
  comments: [{
    user: ObjectId (ref: User),
    content: String,
    createdAt: Date,
    isEdited: Boolean,
    editedAt: Date
  }],
  watchers: [ObjectId] (ref: User),
  blockedBy: [ObjectId] (ref: Task),
  parentTask: ObjectId (ref: Task),
  aiGenerated: Boolean,
  aiSuggestions: {
    recommendedAssignee: ObjectId (ref: User),
    estimatedCompletion: Date,
    riskFactors: [String]
  },
  createdAt: Date (indexed: -1),
  updatedAt: Date,
  completedAt: Date
}

// Subtasks Collection
{
  _id: ObjectId,
  title: String,
  task: ObjectId (ref: Task, indexed),
  isCompleted: Boolean (indexed),
  completedBy: ObjectId (ref: User),
  completedAt: Date,
  createdBy: ObjectId (ref: User),
  order: Number, // For drag-drop ordering
  createdAt: Date,
  updatedAt: Date
}

// ProjectNotes Collection
{
  _id: ObjectId,
  project: ObjectId (ref: Project, indexed),
  title: String,
  content: String (text indexed),
  createdBy: ObjectId (ref: User),
  tags: [String],
  isPinned: Boolean,
  lastEditedBy: ObjectId (ref: User),
  version: Number,
  versionHistory: [{
    content: String,
    editedBy: ObjectId (ref: User),
    editedAt: Date
  }],
  createdAt: Date (indexed: -1),
  updatedAt: Date
}

// ActivityLog Collection (For Audit Trail)
{
  _id: ObjectId,
  user: ObjectId (ref: User, indexed),
  action: String, // 'created' | 'updated' | 'deleted'
  entityType: String, // 'task' | 'project' | 'member'
  entityId: ObjectId,
  changes: {}, // JSON diff of changes
  ipAddress: String,
  userAgent: String,
  createdAt: Date (indexed: -1, TTL: 90 days)
}

// AIInteractions Collection (For Training & Analytics)
{
  _id: ObjectId,
  user: ObjectId (ref: User, indexed),
  interactionType: String, // 'chat' | 'suggestion' | 'analysis'
  input: String,
  output: String,
  context: {
    projectId: ObjectId,
    taskId: ObjectId
  },
  tokenUsage: {
    prompt: Number,
    completion: Number,
    total: Number
  },
  responseTime: Number, // milliseconds
  userFeedback: String, // 'helpful' | 'not_helpful' | null
  createdAt: Date (indexed: -1, TTL: 180 days)
}

// Notifications Collection
{
  _id: ObjectId,
  user: ObjectId (ref: User, indexed),
  type: String, // 'task_assigned' | 'mention' | 'deadline' | 'ai_alert'
  title: String,
  message: String,
  link: String,
  isRead: Boolean (indexed),
  readAt: Date,
  metadata: {}, // Additional context
  createdAt: Date (indexed: -1, TTL: 30 days)
}
```

### Index Strategy

```javascript
// Critical Indexes for Performance

// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ emailVerificationToken: 1 })
db.users.createIndex({ forgotPasswordToken: 1 })

// Projects
db.projects.createIndex({ createdBy: 1 })
db.projects.createIndex({ name: 1 })
db.projects.createIndex({ createdAt: -1 })
db.projects.createIndex({ isArchived: 1 })

// ProjectMembers
db.projectmembers.createIndex({ project: 1, user: 1 }, { unique: true })
db.projectmembers.createIndex({ user: 1 })
db.projectmembers.createIndex({ project: 1, role: 1 })

// Tasks (Most queried collection)
db.tasks.createIndex({ project: 1 })
db.tasks.createIndex({ assignedTo: 1 })
db.tasks.createIndex({ status: 1 })
db.tasks.createIndex({ dueDate: 1 })
db.tasks.createIndex({ createdAt: -1 })
db.tasks.createIndex({ project: 1, status: 1, dueDate: 1 }) // Compound
db.tasks.createIndex({ title: "text", description: "text" }) // Full-text

// Subtasks
db.subtasks.createIndex({ task: 1 })
db.subtasks.createIndex({ isCompleted: 1 })

// Notes
db.projectnotes.createIndex({ project: 1 })
db.projectnotes.createIndex({ createdAt: -1 })
db.projectnotes.createIndex({ title: "text", content: "text" })

// Activity Log
db.activitylogs.createIndex({ createdAt: -1 })
db.activitylogs.createIndex({ user: 1, createdAt: -1 })
db.activitylogs.createIndex({ entityType: 1, entityId: 1 })

// AI Interactions
db.aiinteractions.createIndex({ user: 1, createdAt: -1 })
db.aiinteractions.createIndex({ createdAt: -1 })

// Notifications
db.notifications.createIndex({ user: 1, isRead: 1, createdAt: -1 })
db.notifications.createIndex({ createdAt: -1 })
```

---

# 3. CORE FEATURES SPECIFICATION

## 3.1 User Authentication & Authorization

### 3.1.1 User Registration

**Endpoint**: `POST /api/v1/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "fullName": "John Doe" // Optional
}
```

**Business Logic**:
1. Validate email format (RFC 5322 compliant)
2. Validate username (3-30 chars, alphanumeric + underscore)
3. Validate password strength:
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number
   - At least 1 special character
4. Check if email/username already exists (case-insensitive)
5. Hash password using bcrypt (salt rounds: 10)
6. Generate email verification token (20 random bytes)
7. Hash verification token using SHA256
8. Store hashed token with 24-hour expiry
9. Send verification email via queue (non-blocking)
10. Return user object (exclude sensitive fields)

**Response** (201 Created):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "user": {
      "_id": "65f3a1b2c8e9d0f123456789",
      "username": "johndoe",
      "email": "user@example.com",
      "fullName": "John Doe",
      "isEmailVerified": false,
      "createdAt": "2026-01-07T10:30:00.000Z"
    }
  }
}
```

**Error Responses**:
- 400: Validation errors (weak password, invalid email)
- 409: User already exists
- 500: Server error

**Rate Limit**: 5 requests per 15 minutes per IP

### 3.1.2 Email Verification

**Endpoint**: `GET /api/v1/auth/verify-email/:verificationToken`

**Business Logic**:
1. Extract token from URL parameter
2. Hash the token using SHA256
3. Query database for matching hashed token
4. Check if token hasn't expired
5. Mark user's email as verified
6. Clear verification token and expiry
7. Redirect to success page or return JSON

**Response** (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully",
  "data": {
    "isEmailVerified": true
  }
}
```

**Error Responses**:
- 400: Token missing or invalid format
- 401: Token expired
- 404: No user found with this token

### 3.1.3 User Login

**Endpoint**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Business Logic**:
1. Find user by email (case-insensitive)
2. If user not found, return generic error (prevent enumeration)
3. Compare password using bcrypt
4. If password incorrect, return generic error
5. Generate access token (JWT, 15min expiry)
6. Generate refresh token (JWT, 7 day expiry)
7. Store refresh token in database
8. Set httpOnly, secure cookies for both tokens
9. Return user object and tokens

**JWT Access Token Payload**:
```json
{
  "_id": "65f3a1b2c8e9d0f123456789",
  "email": "user@example.com",
  "username": "johndoe",
  "iat": 1704628200,
  "exp": 1704629100
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "_id": "65f3a1b2c8e9d0f123456789",
      "username": "johndoe",
      "email": "user@example.com",
      "fullName": "John Doe",
      "avatar": {
        "url": "https://cdn.projectcamp.com/avatars/default.png"
      },
      "isEmailVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Security Measures**:
- Rate limit: 5 attempts per 15 minutes per IP
- Account lockout: After 10 failed attempts in 1 hour
- Log all login attempts (IP, user agent, timestamp)
- Send email notification for new device login

### 3.1.4 Token Refresh

**Endpoint**: `POST /api/v1/auth/refresh-token`

**Request**: Refresh token from cookie or body

**Business Logic**:
1. Extract refresh token from cookie or request body
2. Verify JWT signature and expiry
3. Find user by ID from token payload
4. Compare stored refresh token with provided token
5. If match, generate new access + refresh tokens
6. Update stored refresh token
7. Return new tokens

**Response** (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3.1.5 Logout

**Endpoint**: `POST /api/v1/auth/logout`

**Authentication**: Required (JWT)

**Business Logic**:
1. Verify access token
2. Clear refresh token from database
3. Clear both cookies
4. Return success message

### 3.1.6 Password Management

#### Change Password
**Endpoint**: `POST /api/v1/auth/change-password`

**Request Body**:
```json
{
  "oldPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Business Logic**:
1. Verify current password
2. Validate new password strength
3. Ensure new password != old password
4. Hash and update password
5. Invalidate all refresh tokens (force re-login)
6. Send confirmation email

#### Forgot Password
**Endpoint**: `POST /api/v1/auth/forgot-password`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Business Logic**:
1. Find user by email
2. Generate password reset token
3. Store hashed token with 1-hour expiry
4. Send reset email with link
5. Always return success (prevent enumeration)

#### Reset Password
**Endpoint**: `POST /api/v1/auth/reset-password/:resetToken`

**Request Body**:
```json
{
  "newPassword": "NewSecurePass123!"
}
```

**Business Logic**:
1. Validate token and expiry
2. Validate new password
3. Hash and update password
4. Clear reset token
5. Invalidate all refresh tokens
6. Send confirmation email

---

## 3.2 Project Management

### 3.2.1 Create Project

**Endpoint**: `POST /api/v1/projects`

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Website Redesign 2026",
  "description": "Complete overhaul of company website with modern design",
  "settings": {
    "visibility": "team", // 'private' | 'team' | 'public'
    "defaultTaskStatus": "todo",
    "allowGuestAccess": false
  }
}
```

**Business Logic**:
1. Validate project name (unique, 3-100 chars)
2. Create project document
3. Automatically add creator as admin in ProjectMembers
4. Initialize metadata (totalTasks: 0, totalMembers: 1)
5. Trigger AI initial project analysis (async)
6. Log activity
7. Return project object

**Response** (201 Created):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Project created successfully",
  "data": {
    "_id": "65f3b1c2d8f9e0g123456789",
    "name": "Website Redesign 2026",
    "description": "Complete overhaul of company website",
    "createdBy": {
      "_id": "65f3a1b2c8e9d0f123456789",
      "username": "johndoe",
      "fullName": "John Doe"
    },
    "settings": {
      "visibility": "team",
      "defaultTaskStatus": "todo",
      "allowGuestAccess": false
    },
    "metadata": {
      "totalTasks": 0,
      "completedTasks": 0,
      "totalMembers": 1
    },
    "createdAt": "2026-01-07T10:45:00.000Z"
  }
}
```

**Validation Rules**:
- Name: Required, 3-100 characters, unique per workspace
- Description: Optional, max 2000 characters
- Visibility: Must be one of: private, team, public

### 3.2.2 List Projects

**Endpoint**: `GET /api/v1/projects`

**Authentication**: Required

**Query Parameters**:
```
?page=1
&limit=20
&sort=-createdAt  // or 'name', '-updatedAt'
&status=active    // 'active' | 'archived'
&search=website   // Search in name and description
```

**Business Logic**:
1. Get all projects where user is a member
2. Apply filters (archived, search)
3. Apply sorting
4. Paginate results
5. For each project, aggregate:
   - Total members
   - Total tasks
   - Completion percentage
   - Last activity date
6. Return paginated list

**Response** (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Projects fetched successfully",
  "data": {
    "projects": [
      {
        "project": {
          "_id": "65f3b1c2d8f9e0g123456789",
          "name": "Website Redesign 2026",
          "description": "Complete overhaul",
          "members": 5,
          "totalTasks": 23,
          "completedTasks": 8,
          "completionPercentage": 34.78,
          "lastActivityAt": "2026-01-07T09:30:00.000Z",
          "createdAt": "2026-01-05T10:45:00.000Z"
        },
        "role": "admin"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalProjects": 47,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Performance Optimization**:
- Cache results for 60 seconds
- Use aggregation pipeline for efficiency
- Index on: user ID, project name, createdAt

### 3.2.3 Get Project Details

**Endpoint**: `GET /api/v1/projects/:projectId`

**Authentication**: Required

**Authorization**: User must be project member

**Response** (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Project fetched successfully",
  "data": {
    "_id": "65f3b1c2d8f9e0g123456789",
    "name": "Website Redesign 2026",
    "description": "Complete overhaul of company website",
    "createdBy": {
      "_id": "65f3a1b2c8e9d0f123456789",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatar": {
        "url": "https://cdn.projectcamp.com/avatars/johndoe.jpg"
      }
    },
    "settings": {
      "visibility": "team",
      "defaultTaskStatus": "todo",
      "allowGuestAccess": false
    },
    "metadata": {
      "totalTasks": 23,
      "completedTasks": 8,
      "totalMembers": 5,
      "lastActivityAt": "2026-01-07T09:30:00.000Z"
    },
    "aiInsights": {
      "riskLevel": "medium",
      "healthScore": 72,
      "lastAnalyzedAt": "2026-01-07T08:00:00.000Z",
      "recommendations": [
        "3 tasks are overdue - consider reassigning",
        "Team velocity decreased by 15% this week",
        "Recommend adding 1 more developer to stay on schedule"
      ]
    },
    "recentActivity": [
      {
        "type": "task_completed",
        "user": "Alice Smith",
        "description": "Marked 'Design homepage mockup' as done",
        "timestamp": "2026-01-07T09:30:00.000Z"
      }
    ],
    "createdAt": "2026-01-05T10:45:00.000Z",
    "updatedAt": "2026-01-07T09:30:00.000Z"
  }
}
```

### 3.2.4 Update Project

**Endpoint**: `PUT /api/v1/projects/:projectId`

**Authentication**: Required

**Authorization**: Admin role only

**Request Body**:
```json
{
  "name": "Website Redesign 2026 - Q1",
  "description": "Updated description",
  "settings": {
    "visibility": "team"
  }
}
```

**Business Logic