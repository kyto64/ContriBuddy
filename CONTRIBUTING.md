# Contributing to ContriBuddy

Thank you for your interest in contributing to ContriBuddy! We welcome contributions from everyone.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/kyto64/ContriBuddy.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit your changes: `git commit -m "Add your commit message"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
# Install dependencies for all workspaces
npm install

# Start the development servers
npm run dev
```

This will start:
- Frontend development server on http://localhost:3000
- Backend API server on http://localhost:3001

### Environment Variables
1. Copy `.env.example` to `.env` in both frontend and backend directories
2. Update the values as needed for your development environment

## Project Structure

```
ContriBuddy/
├── frontend/          # Vue.js frontend application
├── backend/           # Node.js/Express backend API
├── package.json       # Root workspace configuration
└── README.md
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure your code passes linting checks

## Testing

Before submitting a pull request:
1. Test your changes locally
2. Ensure the application builds without errors
3. Test both frontend and backend functionality

## Pull Request Guidelines

- Create a clear and descriptive title
- Describe what your PR does and why
- Reference any related issues
- Include screenshots for UI changes
- Keep PRs focused and avoid unrelated changes

## Reporting Issues

When reporting issues:
- Use a clear and descriptive title
- Describe the expected behavior vs actual behavior
- Include steps to reproduce
- Include your environment details (OS, Node.js version, etc.)

## Code of Conduct

Be respectful and inclusive. We want this to be a welcoming community for everyone.

## Questions?

Feel free to open an issue with the `question` label if you need help or clarification.

Thank you for contributing!
