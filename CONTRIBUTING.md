# Contributing to ExpenseHub

Thank you for your interest in contributing to ExpenseHub! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and considerate in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/expensehub.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit your changes: `git commit -m "Add your feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git

### Local Setup

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Code Style

### Backend

- Use TypeScript
- Follow ESLint configuration
- Use async/await for asynchronous operations
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Frontend

- Use TypeScript
- Follow React best practices
- Use functional components with hooks
- Keep components small and reusable
- Use Tailwind CSS for styling

## Commit Messages

Follow conventional commits format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example: `feat: add expense filtering by date range`

## Pull Request Process

1. Ensure your code follows the style guidelines
2. Update documentation if needed
3. Add tests for new features
4. Ensure all tests pass
5. Update the README.md if needed
6. Request review from maintainers

## Reporting Bugs

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, etc.)

## Feature Requests

When requesting features:

- Describe the feature clearly
- Explain the use case
- Provide examples if possible
- Consider implementation details

## Questions?

Feel free to open an issue for any questions or clarifications.

Thank you for contributing!

