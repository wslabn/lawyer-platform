# Lawyer Platform 📚⚖️

A comprehensive document and client management platform for lawyers built with Electron and Express. Manage clients, cases, documents, time tracking, and invoicing all in one application.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-v16+-green.svg)
![Electron](https://img.shields.io/badge/electron-v27+-blue.svg)

## ✨ Features

- 👥 **Client Management** - Complete CRUD operations for client information
- 📁 **Case Management** - Link cases to clients with detailed tracking
- 📝 **Document Creation** - Markdown editor with PDF export
- ⏱️ **Time Tracking** - Manual time entries with client/case association
- 💰 **Invoicing** - Generate invoices from time entries
- 🔍 **Search** - Find clients, cases, and documents quickly
- 👨👩👧👦 **Multi-user** - Shared access via local network (1-20 users)

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/lawyer-platform.git
   cd lawyer-platform
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install electron app dependencies:**
   ```bash
   cd ../electron-app
   npm install
   ```

### Running the Application

1. **Start the server:**
   ```bash
   cd server
   npm start
   ```
   Server runs on `http://localhost:3001`

2. **Start the electron app:**
   ```bash
   cd electron-app
   npm start
   ```

## 📁 Project Structure

```
lawyer-platform/
├── electron-app/          # Desktop client application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── services/       # API communication
│   │   └── utils/          # Utilities
│   └── main.js            # Electron main process
├── server/                # Express API server
│   ├── routes/            # API endpoints
│   ├── models/            # Database schemas
│   └── database/          # SQLite database
├── documents/             # Document storage
│   ├── clients/           # Client documents
│   └── templates/         # Legal templates
├── shared/                # Common code
└── PROJECT-PLAN.md        # Detailed documentation
```

## 🛠️ Technology Stack

- **Frontend:** Electron, HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** SQLite
- **Document Processing:** Markdown, markdown-pdf
- **File Storage:** Local file system

## 📖 Usage

### Client Management
1. Add clients with contact information and billing rates
2. Edit and manage client details
3. Link clients to cases and documents

### Document Creation
1. Create documents using markdown editor
2. Use built-in templates for common legal documents
3. Generate PDFs for printing and sharing
4. Organize documents by client and case

### Time Tracking & Invoicing
1. Log time entries for clients and cases
2. Generate invoices from unbilled time entries
3. Track invoice status (draft, sent, paid)
4. View detailed invoice breakdowns

## 🧪 Testing

See [PROJECT-PLAN.md](PROJECT-PLAN.md) for detailed testing instructions and workflows.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [PROJECT-PLAN.md](PROJECT-PLAN.md) for detailed documentation
- Open an issue for bugs or feature requests
- Review the testing section for troubleshooting

## 🗺️ Roadmap

- [ ] Search functionality implementation
- [ ] Enhanced multi-user coordination
- [ ] Additional legal document templates
- [ ] Data backup and export features
- [ ] Mobile companion app
- [ ] Cloud deployment options

---

**Built for lawyers, by developers who care about legal practice efficiency.**