# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a smart education platform MVP focused on high school mathematics improvement. The project aims to provide personalized math tutoring through AI-powered assessment, customized learning plans, and question generation using the Kimi API.

## Core Features

The system is designed to include:

1. **User Registration & Authentication** - Student account management with basic profile information
2. **Foundation Assessment** - Chapter-based testing covering core high school math topics (sets & functions, trigonometry, sequences)
3. **Personalized Learning Plans** - AI-generated study schedules based on assessment results
4. **AI Question Generation** - Practice problems and detailed solutions via Kimi API integration
5. **Progress Tracking** - Learning analytics and performance monitoring

## API Integration

### Kimi API Configuration
- **API Key**: `sk-5WRXcCdiP1HoPDRwpcKnF0Zi5b9th6q12mF50KqBDJrUc62y`
- **Base URL**: `https://api.kimi.com`

### Key API Endpoints
- `/math/questions` - Generate practice problems by topic and difficulty
- `/math/solutions` - Get detailed step-by-step solutions
- `/math/learning-plan` - Create personalized study schedules
- `/math/progress` - Track learning progress
- `/math/feedback` - Generate performance feedback

## Development Status

This repository currently contains only documentation and planning materials:
- `README.md` - Basic project overview
- `production.md` - Detailed MVP requirements and technical specifications
- `调用模型api文档.md` - Kimi API integration examples and documentation

**Note**: No source code has been implemented yet. This is a planning-stage project with comprehensive documentation ready for development.

## Technical Architecture (Planned)

### Frontend
- Simple, clean interface design
- Basic interactive feedback and navigation
- Responsive layout for student accessibility

### Backend
- User management system with simple database architecture
- Kimi API integration for content generation
- Basic data storage for user progress and generated content

### Database
- User information and learning data storage
- Question and solution caching
- Simple relational database structure

## Priority Implementation Order

1. **High Priority (MVP Core)**:
   - User registration/login system
   - Foundation assessment (3-5 core chapters)
   - Basic question generation via Kimi API
   - Simple learning plan creation

2. **Medium Priority (Enhanced Features)**:
   - Progress tracking dashboard
   - Question categorization and search
   - Basic learning analytics

3. **Low Priority (Future Iterations)**:
   - Advanced analytics and reporting
   - Plan customization options
   - Extended content library

## Technology Stack

### Frontend
- **Framework**: Vue 3 + Composition API + TypeScript
- **Build Tool**: Vite
- **UI Library**: Element Plus
- **Router**: Vue Router 4
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Math Rendering**: MathJax
- **Charts**: ECharts

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js + TypeScript
- **Database**: MySQL 8.0+
- **ORM**: Sequelize
- **Authentication**: JWT + bcrypt
- **Documentation**: Swagger
- **Logging**: Winston

### Database Configuration
```javascript
DB_CONFIG: {
  host: '8.153.77.15',
  user: 'connect',
  password: 'Zhjh0704.',
  database: 'smart_education',
  port: 3306,
  charset: 'utf8mb4',
  timezone: '+08:00'
}
```

### Development Commands
Since this is a new project, standard commands will be:
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run linting

## Development Guidelines

- Focus on rapid MVP development and user feedback collection
- Prioritize core functionality over advanced features
- Maintain simple, maintainable code architecture
- Ensure secure handling of student data and API credentials
- Follow Vue 3 Composition API patterns
- Use TypeScript for type safety
- Implement proper error handling and validation