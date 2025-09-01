# Contributing to TrueDest

First off, thank you for considering contributing to TrueDest! It's people like you that make TrueDest such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Setup

1. Fork and clone the repo
```bash
git clone https://github.com/your-username/truedest.git
cd truedest
```

2. Install dependencies
```bash
npm install
```

3. Create a branch
```bash
git checkout -b feature/your-feature-name
```

4. Make your changes and commit
```bash
git add .
git commit -m "Add your feature"
```

5. Push to your fork
```bash
git push origin feature/your-feature-name
```

6. Create a Pull Request

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### JavaScript/TypeScript Styleguide

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable names
- Add comments for complex logic
- Write self-documenting code

### Testing

- Write tests for all new features
- Ensure all tests pass before submitting PR
- Aim for high test coverage
- Include both unit and integration tests where appropriate

## Project Structure

```
truedest/
├── app/           # Next.js pages and API routes
├── components/    # Reusable React components
├── lib/          # Utility functions and services
├── prisma/       # Database schema and migrations
├── public/       # Static assets
├── scripts/      # Build and setup scripts
└── tests/        # Test files
```

## Questions?

Feel free to contact the maintainers if you have any questions. We're here to help!

## Recognition

Contributors will be recognized in our README and release notes. Thank you for your contributions!