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
1. Verify user is project admin
2. Validate updated fields
3. If name changed, check uniqueness
4. Update project document
5. Log changes in activity log
6. Invalidate cache for this project
7. Trigger AI re-analysis if significant changes
8. Return updated project

**Response** (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Project updated successfully",
  "data": {
    "_id": "65f3b1c2d8f9e0g123456789",
    "name": "Website Redesign 2026 - Q1",
    "description": "Updated description",
    "updatedAt": "2026-01-07T10:50:00.000Z"
  }
}
```

### 3.2.5 Delete Project

**Endpoint**: `DELETE /api/v1/projects/:projectId`

**Authentication**: Required

**Authorization**: Admin role only

**Business Logic**:
1. Verify user is project admin
2. Soft delete: Set `isArchived: true` and `archivedAt: Date.now()`
3. Option to hard delete after 30 days in archive
4. Delete all associated data:
   - Tasks and subtasks
   - Notes
   - Project members
   - Activity logs (keep audit trail for 90 days)
5. Remove files from S3
6. Log deletion activity
7. Send notification to all members

**Response** (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Project archived successfully. Will be permanently deleted in 30 days.",
  "data": {
    "projectId": "65f3b1c2d8f9e0g123456789",
    "archivedAt": "2026-01-07T11:00:00.000Z",
    "permanentDeletionDate": "2026-02-06T11:00:00.000Z"
  }
}
```

---

## 3.3 Team Member Management

### 3.3.1 Add Member to Project

**Endpoint**: `POST /api/v1/projects/:projectId/members`

**Authentication**: Required

**Authorization**: Admin role only

**Request Body**:
```json
{
  "email": "newmember@example.com",
  "role": "member", // 'admin' | 'project_admin' | 'member'
  "permissions": {
    "canCreateTasks": true,
    "canDeleteTasks": false,
    "canManageMembers": false,
    "canViewReports": true
  }
}
```

**Business Logic**:
1. Verify project exists
2. Find user by email
3. If user doesn't exist, send invitation email
4. Check if user already member
5. Create ProjectMember document
6. Send notification to new member
7. Update project metadata (totalMembers++)
8. Log activity
9. Return member details

**Response** (201 Created):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Member added successfully",
  "data": {
    "user": {
      "_id": "65f3c1d2e8f9g0h123456789",
      "username": "newmember",
      "email": "newmember@example.com",
      "fullName": "New Member",
      "avatar": {
        "url": "https://cdn.projectcamp.com/avatars/default.png"
      }
    },
    "role": "member",
    "joinedAt": "2026-01-07T11:05:00.000Z",
    "invitedBy": {
      "_id": "65f3a1b2c8e9d0f123456789",
      "username": "johndoe"
    }
  }
}
```

### 3.3.2 List Project Members

**Endpoint**: `GET /api/v1/projects/:projectId/members`

**Authentication**: Required

**Authorization**: Any project member

**Query Parameters**:
```
?role=admin  // Filter by role
&search=john // Search by name/username
```

**Response** (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Project members fetched successfully",
  "data": [
    {
      "user": {
        "_id": "65f3a1b2c8e9d0f123456789",
        "username": "johndoe",
        "fullName": "John Doe",
        "email": "john@example.com",
        "avatar": {
          "url": "https://cdn.projectcamp.com/avatars/johndoe.jpg"
        }
      },
      "role": "admin",
      "joinedAt": "2026-01-05T10:45:00.000Z",
      "permissions": {
        "canCreateTasks": true,
        "canDeleteTasks": true,
        "canManageMembers": true,
        "canViewReports": true
      },
      "stats": {
        "tasksAssigned": 12,
        "tasksCompleted": 8,
        "lastActive": "2026-01-07T10:30:00.000Z"
      }
    }
  ]
}
```

### 3.3.3 Update Member Role

**Endpoint**: `PUT /api/v1/projects/:projectId/members/:userId`

**Authentication**: Required

**Authorization**: Admin role only

**Request Body**:
```json
{
  "role": "project_admin",
  "permissions": {
    "canCreateTasks": true,
    "canDeleteTasks": true,
    "canManageMembers": false,
    "canViewReports": true
  }
}
```

**Business Logic**:
1. Verify requester is admin
2. Prevent removing last admin
3. Update role and permissions
4. Send notification to affected user
5. Log activity
6. Return updated member

### 3.3.4 Remove Member

**Endpoint**: `DELETE /api/v1/projects/:projectId/members/:userId`

**Authentication**: Required

**Authorization**: Admin role only

**Business Logic**:
1. Verify requester is admin
2. Prevent removing last admin
3. Reassign member's tasks to requester or unassign
4. Delete ProjectMember document
5. Update project metadata (totalMembers--)
6. Send notification to removed member
7. Log activity

---

## 3.4 Task Management

### 3.4.1 Create Task

**Endpoint**: `POST /api/v1/tasks/:projectId`

**Authentication**: Required

**Authorization**: Admin or Project Admin

**Request Body** (multipart/form-data):
```json
{
  "title": "Design homepage mockup",
  "description": "Create high-fidelity mockup for new homepage design",
  "assignedTo": "65f3c1d2e8f9g0h123456789", // User ID
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-01-15T23:59:59.000Z",
  "estimatedHours": 8,
  "tags": ["design", "frontend", "urgent"],
  "attachments": [File, File] // Multipart files
}
```

**Business Logic**:
1. Verify project exists
2. Verify assignee is project member
3. Validate due date (future date)
4. Upload attachments to S3
5. Generate unique task ID
6. Create task document
7. Update project metadata (totalTasks++)
8. Send notification to assignee
9. Trigger AI task analysis (priority suggestion, time estimate validation)
10. Log activity
11. Return created task

**Response** (201 Created):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Task created successfully",
  "data": {
    "_id": "65f3d1e2f8g9h0i123456789",
    "title": "Design homepage mockup",
    "description": "Create high-fidelity mockup for new homepage design",
    "project": "65f3b1c2d8f9e0g123456789",
    "assignedTo": {
      "_id": "65f3c1d2e8f9g0h123456789",
      "username": "designer",
      "fullName": "Jane Designer",
      "avatar": {
        "url": "https://cdn.projectcamp.com/avatars/designer.jpg"
      }
    },
    "assignedBy": {
      "_id": "65f3a1b2c8e9d0f123456789",
      "username": "johndoe"
    },
    "status": "todo",
    "priority": "high",
    "dueDate": "2026-01-15T23:59:59.000Z",
    "estimatedHours": 8,
    "actualHours": 0,
    "tags": ["design", "frontend", "urgent"],
    "attachments": [
      {
        "url": "https://cdn.projectcamp.com/files/task-65f3d1e2/reference.pdf",
        "filename": "design-reference.pdf",
        "mimetype": "application/pdf",
        "size": 2458624,
        "uploadedAt": "2026-01-07T11:15:00.000Z"
      }
    ],
    "aiSuggestions": {
      "recommendedAssignee": "65f3c1d2e8f9g0h123456789",
      "estimatedCompletion": "2026-01-14T17:00:00.000Z",
      "riskFactors": ["Tight deadline", "Dependencies on design system"]
    },
    "createdAt": "2026-01-07T11:15:00.000Z"
  }
}
```

**File Upload Specifications**:
- Max file size: 50MB per file
- Max files per task: 10
- Allowed types: PDF, images (jpg, png, gif), docs (docx, xlsx), archives (zip)
- Storage: AWS S3 with CDN
- Naming: `task-{taskId}/{timestamp}-{originalname}`

### 3.4.2 List Tasks

**Endpoint**: `GET /api/v1/tasks/:projectId`

**Authentication**: Required

**Authorization**: Any project member

**Query Parameters**:
```
?status=in_progress         // Filter by status
&priority=high              // Filter by priority
&assignedTo=userId          // Filter by assignee
&tags=design,frontend       // Filter by tags (comma-separated)
&search=homepage            // Search in title/description
&dueDate[gte]=2026-01-10    // Due date >= 
&dueDate[lte]=2026-01-20    // Due date <=
&sort=-createdAt            // Sort: -createdAt, dueDate, priority
&page=1
&limit=20
```

**Response** (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Tasks fetched successfully",
  "data": {
    "tasks": [
      {
        "_id": "65f3d1e2f8g9h0i123456789",
        "title": "Design homepage mockup",
        "description": "Create high-fidelity mockup",
        "status": "in_progress",
        "priority": "high",
        "dueDate": "2026-01-15T23:59:59.000Z",
        "assignedTo": {
          "_id": "65f3c1d2e8f9g0h123456789",
          "username": "designer",
          "avatar": {
            "url": "https://cdn.projectcamp.com/avatars/designer.jpg"
          }
        },
        "tags": ["design", "frontend"],
        "subtasksCount": 3,
        "subtasksCompleted": 1,
        "commentsCount": 5,
        "attachmentsCount": 2,
        "createdAt": "2026-01-07T11:15:00.000Z",
        "updatedAt": "2026-01-07T14:20:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTasks": 87,
      "hasNextPage": true
    },
    "summary": {
      "total": 87,
      "byStatus": {
        "todo": 32,
        "in_progress": 28,
        "done": 27
      },
      "byPriority": {
        "low": 15,
        "medium": 42,
        "high": 23,
        "critical": 7
      },
      "overdue": 5
    }
  }
}
```

**Performance Optimization**:
- Cache task lists for 30 seconds
- Use compound indexes for filtering
- Paginate large result sets

### 3.4.3 Get Task Details

**Endpoint**: `GET /api/v1/tasks/:projectId/t/:taskId`

**Authentication**: Required

**Authorization**: Any project member

**Response** (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Task fetched successfully",
  "data": {
    "_id": "65f3d1e2f8g9h0i123456789",
    "title": "Design homepage mockup",
    "description": "Create high-fidelity mockup for new homepage design with modern aesthetics",
    "project": {
      "_id": "65f3b1c2d8f9e0g123456789",
      "name": "Website Redesign 2026"
    },
    "assignedTo": {
      "_id": "65f3c1d2e8f9g0h123456789",
      "username": "designer",
      "fullName": "Jane Designer",
      "avatar": {
        "url": "https://cdn.projectcamp.com/avatars/designer.jpg"
      }
    },
    "assignedBy": {
      "_id": "65f3a1b2c8e9d0f123456789",
      "username": "johndoe",
      "fullName": "John Doe"
    },
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2026-01-15T23:59:59.000Z",
    "estimatedHours": 8,
    "actualHours": 4.5,
    "tags": ["design", "frontend", "urgent"],
    "attachments": [
      {
        "url": "https://cdn.projectcamp.com/files/task-65f3d1e2/reference.pdf",
        "filename": "design-reference.pdf",
        "mimetype": "application/pdf",
        "size": 2458624,
        "uploadedAt": "2026-01-07T11:15:00.000Z",
        "uploadedBy": {
          "_id": "65f3a1b2c8e9d0f123456789",
          "username": "johndoe"
        }
      }
    ],
    "subtasks": [
      {
        "_id": "65f3e1f2g8h9i0j123456789",
        "title": "Research competitor designs",
        "isCompleted": true,
        "completedAt": "2026-01-07T13:00:00.000Z",
        "createdBy": {
          "_id": "65f3c1d2e8f9g0h123456789",
          "username": "designer"
        }
      },
      {
        "_id": "65f3e1f2g8h9i0j123456790",
        "title": "Create wireframes",
        "isCompleted": false,
        "createdBy": {
          "_id": "65f3c1d2e8f9g0h123456789",
          "username": "designer"
        }
      }
    ],
    "comments": [
      {
        "user": {
          "_id": "65f3a1b2c8e9d0f123456789",
          "username": "johndoe",
          "avatar": {
            "url": "https://cdn.projectcamp.com/avatars/johndoe.jpg"
          }
        },
        "content": "Please focus on mobile-first design",
        "createdAt": "2026-01-07T12:30:00.000Z",
        "isEdited": false
      }
    ],
    "watchers": ["65f3a1b2c8e9d0f123456789", "65f3c1d2e8f9g0h123456789"],
    "aiSuggestions": {
      "recommendedAssignee": "65f3c1d2e8f9g0h123456789",
      "estimatedCompletion": "2026-01-14T17:00:00.000Z",
      "riskFactors": ["Tight deadline", "Dependencies on design system"]
    },
    "createdAt": "2026-01-07T11:15:00.000Z",
    "updatedAt": "2026-01-07T14:20:00.000Z"
  }
}
```

### 3.4.4 Update Task

**Endpoint**: `PUT /api/v1/tasks/:projectId/t/:taskId`

**Authentication**: Required

**Authorization**: Admin, Project Admin, or task assignee

**Request Body** (multipart/form-data):
```json
{
  "title": "Updated title",
  "status": "in_progress",
  "priority": "critical",
  "assignedTo": "newUserId",
  "actualHours": 5,
  "attachments": [File] // Additional files
}
```

**Business Logic**:
1. Verify permissions
2. Upload new attachments
3. Update fields
4. If status changed to 'done':
   - Set completedAt timestamp
   - Update project metadata
   - Trigger completion notification
5. If assignee changed:
   - Notify new assignee
   - Log reassignment
6. Invalidate cache
7. Return updated task

### 3.4.5 Delete Task

**Endpoint**: `DELETE /api/v1/tasks/:projectId/t/:taskId`

**Authentication**: Required

**Authorization**: Admin or Project Admin only

**Business Logic**:
1. Verify permissions
2. Delete all subtasks
3. Delete all comments
4. Delete files from S3
5. Delete task document
6. Update project metadata (totalTasks--)
7. Log deletion
8. Return confirmation

---

## 3.5 Subtask Management

### 3.5.1 Create Subtask

**Endpoint**: `POST /api/v1/tasks/:projectId/t/:taskId/subtasks`

**Authentication**: Required

**Authorization**: Admin, Project Admin

**Request Body**:
```json
{
  "title": "Review color palette options",
  "order": 1
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Subtask created successfully",
  "data": {
    "_id": "65f3f1g2h8i9j0k123456789",
    "title": "Review color palette options",
    "task": "65f3d1e2f8g9h0i123456789",
    "isCompleted": false,
    "order": 1,
    "createdBy": {
      "_id": "65f3a1b2c8e9d0f123456789",
      "username": "johndoe"
    },
    "createdAt": "2026-01-07T15:00:00.000Z"
  }
}
```

### 3.5.2 Update Subtask

**Endpoint**: `PUT /api/v1/tasks/:projectId/st/:subTaskId`

**Authentication**: Required

**Authorization**: Any project member (to toggle completion), Admin/Project Admin (to edit)

**Request Body**:
```json
{
  "title": "Updated subtask title",
  "isCompleted": true
}
```

**Business Logic**:
1. If toggling completion:
   - Allow any project member
   - Set completedBy and completedAt
   - Recalculate parent task progress
2. If editing title/order:
   - Require Admin/Project Admin
3. Return updated subtask

### 3.5.3 Delete Subtask

**Endpoint**: `DELETE /api/v1/tasks/:projectId/st/:subTaskId`

**Authentication**: Required

**Authorization**: Admin or Project Admin only

---

## 3.6 Project Notes

### 3.6.1 Create Note

**Endpoint**: `POST /api/v1/notes/:projectId`

**Authentication**: Required

**Authorization**: Admin only

**Request Body**:
```json
{
  "title": "Meeting Notes - Jan 7",
  "content": "## Key Decisions\n\n- Approved new color scheme\n- Delayed mobile launch to Q2",
  "tags": ["meeting", "decisions"],
  "isPinned": false
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Note created successfully",
  "data": {
    "_id": "65f3g1h2i8j9k0l123456789",
    "title": "Meeting Notes - Jan 7",
    "content": "## Key Decisions\n\n- Approved new color scheme",
    "project": "65f3b1c2d8f9e0g123456789",
    "createdBy": {
      "_id": "65f3a1b2c8e9d0f123456789",
      "username": "johndoe",
      "fullName": "John Doe"
    },
    "tags": ["meeting", "decisions"],
    "isPinned": false,
    "version": 1,
    "createdAt": "2026-01-07T16:00:00.000Z"
  }
}
```

### 3.6.2 List Notes

**Endpoint**: `GET /api/v1/notes/:projectId`

**Query Parameters**:
```
?search=meeting
&tags=decisions
&pinned=true
&sort=-createdAt
```

### 3.6.3 Update Note

**Endpoint**: `PUT /api/v1/notes/:projectId/n/:noteId`

**Business Logic**:
1. Save current version to versionHistory
2. Increment version number
3. Update content and lastEditedBy
4. Return updated note with version info

### 3.6.4 Delete Note

**Endpoint**: `DELETE /api/v1/notes/:projectId/n/:noteId`

---

# 4. AI ASSISTANT FEATURES

## 4.1 AI Architecture

### 4.1.1 Core Components

```
┌─────────────────────────────────────────┐
│         AI Service Layer                │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Context Manager                  │ │
│  │  - User preferences              │ │
│  │  - Project data                  │ │
│  │  - Conversation history          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  AI Capabilities                 │ │
│  │  - Task Generation               │ │
│  │  - Smart Assignment              │ │
│  │  - Risk Analysis                 │ │
│  │  - Timeline Prediction           │ │
│  │  - Natural Language Chat         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  LLM Integration                 │ │
│  │  - OpenAI GPT-4 Turbo            │ │
│  │  - Anthropic Claude (fallback)   │ │
│  │  - Local model (future)          │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 4.1.2 AI Features Matrix

| Feature | Description | User Benefit | API Endpoint |
|---------|-------------|--------------|--------------|
| **Task Suggestions** | Generate relevant tasks based on project context | Reduces planning time by 60% | `POST /api/v1/ai/suggest-tasks/:projectId` |
| **Smart Assignment** | Recommend best team member for task | Optimal resource allocation | `POST /api/v1/ai/assign-task/:taskId` |
| **Risk Detection** | Identify project risks automatically | Proactive problem-solving | `GET /api/v1/ai/analyze-risks/:projectId` |
| **Timeline Prediction** | Forecast project completion date | Accurate deadline planning | `GET /api/v1/ai/predict-timeline/:projectId` |
| **Workload Balance** | Suggest task redistribution | Prevent burnout | `GET /api/v1/ai/balance-workload/:projectId` |
| **Natural Chat** | Conversational assistant | Intuitive interaction | `POST /api/v1/ai/chat` (WebSocket) |
| **Auto-Prioritization** | Suggest task priorities | Focus on what matters | `POST /api/v1/ai/prioritize/:taskId` |
| **Meeting Summary** | Generate action items from notes | Save post-meeting time | `POST /api/v1/ai/summarize-meeting` |

## 4.2 AI Endpoint Specifications

### 4.2.1 Generate Task Suggestions

**Endpoint**: `POST /api/v1/ai/suggest-tasks/:projectId`

**Request Body**:
```json
{
  "context": "We're building a mobile app for fitness tracking",
  "count": 5,
  "includeSubtasks": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Task suggestions generated",
  "data": {
    "suggestions": [
      {
        "title": "Design user onboarding flow",
        "description": "Create wireframes and mockups for the app onboarding experience, including sign-up, profile setup, and goal selection",
        "priority": "high",
        "estimatedHours": 12,
        "recommendedAssignee": {
          "_id": "65f3c1d2e8f9g0h123456789",
          "username": "designer",
          "reasoning": "Has experience with mobile UX and completed similar onboarding designs"
        },
        "suggestedTags": ["design", "mobile", "ux"],
        "subtasks": [
          "Research competitor onboarding flows",
          "Create user journey map",
          "Design wireframes",
          "Create high-fidelity mockups"
        ],
        "dependencies": []
      },
      {
        "title": "Set up Firebase authentication",
        "description": "Implement user authentication using Firebase Auth with email/password and social login options",
        "priority": "critical",
        "estimatedHours": 8,
        "recommendedAssignee": {
          "_id": "65f3d1e2f8g9h0i123456790",
          "username": "backend_dev",
          "reasoning": "Backend specialist with Firebase experience"
        },
        "suggestedTags": ["backend", "authentication", "firebase"],
        "subtasks": [
          "Configure Firebase project",
          "Implement email/password auth",
          "Add Google Sign-In",
          "Add Apple Sign-In"
        ],
        "dependencies": []
      }
    ],
    "reasoning": "Based on typical fitness app development patterns and your team's skill distribution, these tasks form a solid foundation for your MVP",
    "estimatedTotalTime": "48 hours",
    "confidence": 0.87,
    "metadata": {
      "model": "gpt-4-turbo-2024-04-09",
      "tokensUsed": 1250,
      "processingTime": 3200
    }
  }
}
```

### 4.2.2 Smart Task Assignment

**Endpoint**: `POST /api/v1/ai/assign-task/:taskId`

**Request Body**:
```json
{
  "considerWorkload": true,
  "considerSkills": true,
  "considerAvailability": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Assignment recommendation generated",
  "data": {
    "recommendations": [
      {
        "user": {
          "_id": "65f3c1d2e8f9g0h123456789",
          "username": "designer",
          "fullName": "Jane Designer"
        },
        "score": 0.92,
        "reasoning": [
          "Has completed 15 similar design tasks with 95% on-time rate",
          "Current workload: 2 tasks (below team average of 3.5)",
          "Available: Full capacity this week",
          "Skills match: UI/UX Design, Figma, Mobile Design"
        ],
        "estimatedCompletionDate": "2026-01-12T17:00:00.000Z",
        "riskFactors": []
      },
      {
        "user": {
          "_id": "65f3e1f2g8h9i0j123456791",
          "username": "designer2",
          "fullName": "Bob Designer"
        },
        "score": 0.78,
        "reasoning": [
          "Has completed 8 similar tasks with 85% on-time rate",
          "Current workload: 4 tasks (above team average)",
          "Available: Limited capacity due to other priorities",
          "Skills match: UI/UX Design, Adobe XD"
        ],
        "estimatedCompletionDate": "2026-01-14T17:00:00.000Z",
        "riskFactors": ["High workload may delay delivery"]
      }
    ],
    "metadata": {
      "analyzedMembers": 5,
      "model": "gpt-4-turbo-2024-04-09"
    }
  }
}
```

### 4.2.3 Project Risk Analysis

**Endpoint**: `GET /api/v1/ai/analyze-risks/:projectId`

**Response** (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Risk analysis completed",
  "data": {
    "overallRisk": "medium",
    "healthScore": 72,
    "risks": [
      {
        "category": "schedule",
        "severity": "high",
        "title": "5 tasks overdue by 3+ days",
        "description": "Multiple tasks have missed their deadlines, potentially impacting the overall project timeline",
        "affectedTasks": [
          {
            "_id": "65f3d1e2f8g9h0i123456789",
            "title": "API integration",
            "daysOverdue": 5
          }
        ],
        "recommendations": [
          "Reassign 2 overdue tasks to available team members",
          "Consider extending project timeline by 1 week",
          "Schedule daily standup to track progress"
        ],
        "impact": "Could delay launch by 1-2 weeks"
      },
      {
        "category": "resource",
        "severity": "medium",
        "title": "Workload imbalance detected",
        "description": "2 team members have 60% more tasks than the team average",
        "affectedMembers": [
          {
            "username": "developer1",
            "currentTasks": 8,
            "teamAverage": 5
          }
        **:
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