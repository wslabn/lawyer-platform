# Lawyer Document & Client Management Platform - Project Plan

## Overview
Basic document and client management platform for lawyers using Electron with multi-user support (1-20 users on same network).

## Core Requirements
- **Client Management**: CRUD operations for client information
- **Case Management**: Link cases to clients with case details
- **Document System**: Markdown-based document creation with PDF export
- **Time Tracking**: Start/stop timers and manual time entries
- **Invoicing**: Generate invoices from time tracking data
- **Search**: Full-text search across clients, cases, and documents
- **Multi-user**: Shared access via local network server

## Technical Architecture

### Tech Stack
- **Frontend**: Electron desktop application
- **Backend**: Node.js/Express server (local network)
- **Database**: SQLite (shared database file)
- **Document Storage**: File system with database metadata
- **Document Creation**: Markdown editor with live preview
- **PDF Generation**: Puppeteer or markdown-pdf
- **Network**: Same network deployment (1-20 users)

### Project Structure
```
lawyer-platform/
├── electron-app/              # Desktop client application
│   ├── src/
│   │   ├── components/        # UI components (Client, Case, Document, Time, Invoice)
│   │   ├── services/          # API communication services
│   │   └── utils/             # PDF generation, markdown parsing utilities
│   ├── package.json
│   └── main.js               # Electron main process
├── server/                   # Express server
│   ├── routes/               # API endpoints
│   │   ├── clients.js
│   │   ├── cases.js
│   │   ├── documents.js
│   │   ├── time.js
│   │   └── invoices.js
│   ├── models/               # Database schemas and operations
│   ├── storage/              # File management utilities
│   ├── database/             # SQLite database file location
│   └── server.js             # Express server entry point
├── shared/                   # Common code between client and server
│   └── types/                # TypeScript interfaces/types
├── documents/                # Document storage directory
│   ├── clients/              # Organized by client
│   └── templates/            # Legal document templates
└── README.md
```

## Core Modules

### 1. Client Management
- Add/edit/delete clients
- Store: name, contact info, billing details
- Link to cases and documents

### 2. Case Management  
- Create cases linked to clients
- Store: case number, description, status, dates
- Link to documents and time entries

### 3. Document System
- **Creation**: Markdown editor with live preview
- **Templates**: Pre-built legal document templates
- **Storage**: Save .md files, generate .pdf exports
- **Organization**: File structure by client/case
- **Versioning**: Track document revisions

### 4. Time Tracking
- Start/stop timers for active work
- Manual time entry with descriptions
- Link time entries to clients/cases
- Hourly rate configuration per client/case

### 5. Invoicing
- Generate invoices from time entries
- Client billing information integration
- PDF invoice generation
- Invoice status tracking (draft, sent, paid)

### 6. Search System
- Full-text search across:
  - Client information
  - Case details  
  - Document content (markdown)
  - Time entry descriptions

## Document Workflow
1. **Create**: Use markdown editor with legal templates
2. **Edit**: Live preview while editing
3. **Finalize**: Export to PDF when complete
4. **Store**: Keep both .md (editable) and .pdf (final) versions
5. **Organize**: File structure by client/case hierarchy

## Database Schema (SQLite)

### Tables
- **clients**: id, name, email, phone, address, billing_rate, created_at
- **cases**: id, client_id, case_number, title, description, status, created_at
- **documents**: id, client_id, case_id, filename, title, type, file_path, created_at, updated_at
- **time_entries**: id, client_id, case_id, description, hours, rate, date, created_at
- **invoices**: id, client_id, invoice_number, total, status, created_at, due_date

## Development Phases

### Phase 1: Foundation ✅ COMPLETED
- [x] Project structure setup
- [x] Express server with SQLite
- [x] Basic Electron app shell
- [x] Database schema creation

### Phase 2: Core Features ✅ COMPLETED
- [x] Client CRUD operations
- [x] Case management
- [x] Basic document storage
- [x] Simple time tracking

### Phase 3: Document System ✅ COMPLETED
- [x] Markdown editor integration
- [x] PDF generation
- [x] Document templates
- [x] File organization

### Phase 4: Advanced Features ✅ COMPLETED
- [x] Invoicing system
- [ ] Search functionality
- [ ] Multi-user coordination
- [ ] Data backup/export

### Phase 5: Testing & Refinement
- [ ] End-to-end testing
- [ ] Bug fixes and improvements
- [ ] Performance optimization
- [ ] User interface enhancements
- [ ] Additional legal document templates
- [ ] Search implementation
- [ ] Multi-user testing

## Legal Document Templates (Future)
- Client intake forms
- Retainer agreements
- Legal letters
- Court filings
- Contract templates
- Case briefs

## Deployment Notes
- Server runs on local network (accessible to 1-20 users)
- SQLite database shared via network location
- Document files stored on shared network drive
- Electron app distributed to each user workstation

## Success Criteria
- Lawyers can manage clients and cases efficiently
- Document creation workflow is intuitive
- Time tracking integrates seamlessly with billing
- Search finds relevant information quickly
- Multi-user access works without conflicts
- System handles 1-20 concurrent users reliably

## Completed Features ✅

### Client Management
- ✅ Add, edit, delete clients
- ✅ Store contact info and billing rates
- ✅ Client listing with actions

### Case Management
- ✅ Create cases linked to clients
- ✅ Case listing with client names
- ✅ Case selection in time tracking

### Document System
- ✅ Markdown document creation
- ✅ Document editing with live preview
- ✅ PDF generation from markdown
- ✅ Client/case document linking
- ✅ Document templates (intake form, retainer agreement)
- ✅ Organized file storage by client

### Time Tracking
- ✅ Manual time entry creation
- ✅ Client/case association
- ✅ Automatic rate population from client
- ✅ Time entry listing with totals

### Invoicing
- ✅ Generate invoices from time entries
- ✅ Unbilled time tracking
- ✅ Invoice status management (draft/sent/paid)
- ✅ Detailed invoice views
- ✅ Automatic invoice numbering
- ✅ Due date management

## Testing Instructions

### Setup
1. **Install Dependencies:**
   ```bash
   # Server
   cd server
   npm install
   
   # Electron App
   cd ../electron-app
   npm install
   ```

2. **Start Server:**
   ```bash
   cd server
   npm start
   # Server runs on http://localhost:3001
   ```

3. **Start Electron App:**
   ```bash
   cd electron-app
   npm start
   ```

### Testing Workflow
1. **Test Client Management:**
   - Add new clients with billing rates
   - Edit client information
   - Verify client listing

2. **Test Case Management:**
   - Create cases for existing clients
   - Verify case-client relationships

3. **Test Time Tracking:**
   - Add time entries for clients/cases
   - Verify automatic rate population
   - Check time entry calculations

4. **Test Document System:**
   - Create markdown documents
   - Test live preview functionality
   - Generate PDFs from documents
   - Verify file organization

5. **Test Invoicing:**
   - Generate invoices from unbilled time
   - Test invoice status updates
   - Verify invoice details and totals

### Known Issues & Improvements Needed
- [ ] Search functionality not implemented
- [ ] Multi-user conflict resolution needed
- [ ] Document templates could be expanded
- [ ] Invoice PDF generation not implemented
- [ ] Time tracking timer functionality missing
- [ ] Data validation could be enhanced
- [ ] Error handling improvements needed

### Modification Guidelines

**Adding New Features:**
1. Update database schema in `server/models/database.js`
2. Create API routes in `server/routes/`
3. Add API methods to `electron-app/src/services/api.js`
4. Update UI in `electron-app/src/index.html`
5. Add functionality to `electron-app/src/app.js`

**Common Modifications:**
- **New Document Templates:** Add to `documents/templates/`
- **Database Changes:** Update `createTables()` function
- **UI Improvements:** Modify CSS in `index.html`
- **API Endpoints:** Add routes following existing patterns
- **Validation:** Add checks in both client and server code

---
*Last Updated: December 2024*
*Status: Core Features Complete - Testing Phase*