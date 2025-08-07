# ContribHub

🧭 **ContribHub** is a web application that recommends open-source projects and contribution opportunities tailored to your skills. By leveraging the GitHub API, it helps developers—especially beginners—find meaningful ways to contribute to OSS.

## ✨ Features

- **Personalized Recommendations**: Get OSS project suggestions based on your programming languages, frameworks, and interests
- **Smart Matching**: Advanced algorithm that considers your experience level and preferences
- **Issue Discovery**: Find beginner-friendly issues in recommended projects
- **Real-time Data**: Up-to-date project information from GitHub API
- **Responsive Design**: Modern, mobile-friendly interface built with Vue.js and Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm
- GitHub Personal Access Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kyto64/ContribHub.git
   cd ContribHub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp .env.example backend/.env
   cp .env.example frontend/.env

   # Edit backend/.env and add your GitHub token
   # Edit frontend/.env if needed
   ```

4. **Get a GitHub Personal Access Token**
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate a new token with `public_repo` scope
   - Add it to `backend/.env` as `GITHUB_TOKEN=your_token_here`

5. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🛠️ Technology Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management
- **Vue Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **Zod** - Schema validation
- **GitHub API** - Repository and issue data

## 📁 Project Structure

```
ContribHub/
├── frontend/                 # Vue.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable Vue components
│   │   ├── views/          # Page components
│   │   ├── stores/         # Pinia state management
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript type definitions
│   └── package.json
├── package.json            # Root workspace configuration
└── README.md
```

## 🔧 Development

### Available Scripts

```bash
# Install all dependencies
npm install

# Start development servers (frontend + backend)
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Build for production
npm run build

# Type checking
npm run type-check
```

### API Endpoints

- `GET /api/repositories/search` - Search repositories by technology
- `GET /api/repositories/:owner/:name` - Get repository details
- `GET /api/repositories/:owner/:name/issues` - Get repository issues
- `POST /api/recommendations` - Get personalized recommendations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛡️ Security

If you discover a security vulnerability, please see our [Security Policy](SECURITY.md) for instructions on responsible disclosure.

## 🐛 Issues

Found a bug? Have a feature request? Please check our [Issues](https://github.com/kyto64/ContribHub/issues) page or create a new one.

## 🙏 Acknowledgments

- Thanks to the GitHub API for providing access to repository data
- Built with love for the open-source community
- Special thanks to all contributors

---

**Made with ❤️ for the OSS community**
