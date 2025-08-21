# Backend Action Plan: ExpressJS + TypeScript

## Learning Goals & Approach

**Primary Goal**: Learn backend development from scratch
**Experience Level**: Software Engineer with 2-3 years of experience
**Learning Philosophy**: Understand core concepts first, then scale up gradually
**AI Role**: Guide and explain concepts rather than providing complete solutions

## Current Status

**Current Phase**: Phase 2 - Persistence with MongoDB
**Last Updated**: [Current Date]
**Project**: Full ExpressJS Todo App

## Phase Breakdown

### Phase 1: Foundation (Days 1–7) ✅ COMPLETED

- Set up project structure (controllers, models, routes, services)
- Understand routing and route handlers
- Implement controllers using class-based OOP style
- Define TypeScript interfaces for Post model and API types
- Add endpoints: GET /posts, GET /posts/:id, POST /posts
- Add error handling and logging (e.g., with Morgan)

**What was learned**: Basic Express.js structure, TypeScript interfaces, routing concepts, controller patterns

### Phase 2: Persistence with MongoDB (Week 2) 🔄 IN PROGRESS

- Connect to MongoDB using Mongoose
- Create schemas and models
- Refactor controllers to use database
- Add PUT and DELETE endpoints
- Store DB credentials in .env

**Current Focus**: Setting up MongoDB connection and creating proper schemas
**Next Steps**: [To be updated as we progress]

### Phase 3: Auth and Security (Weeks 3–4)

- Create user model and auth routes
- Implement JWT login and register
- Hash passwords with bcrypt
- Protect routes using middleware
- Add role-based access control (optional)

### Phase 4: Dockerize the App (Weeks 4–5)

- Write Dockerfile and docker-compose.yml
- Containerize MongoDB and the app
- Use .env.docker for environment config
- Test container setup locally

### Phase 5: Deployment + Remote DB (Week 6–7)

- Connect to MongoDB Atlas (remote)
- Deploy using Render, Railway, or AWS
- Manage secrets and environment vars
- Set up CI/CD with GitHub Actions

### Phase 6: Advanced Topics (Week 8+)

- Add unit and integration testing (Jest, Supertest)
- Implement Redis caching
- Add pagination, filtering, search
- Upload files (e.g., to S3 or Cloudinary)
- Explore microservices and WebSockets

## Weekly Breakdown

- **Week 1**: Express + TypeScript basics — Working routes, controllers, errors ✅
- **Week 2**: MongoDB + Mongoose — CRUD with database 🔄
- **Weeks 3–4**: Auth & middleware — Login/register + JWT
- **Weeks 4–5**: Docker — Fully containerized app
- **Week 6**: Deployment — Live version of app online
- **Week 7+**: Advanced features — Production-ready features

## Learning Approach & Guidelines

1. **Concept First**: Understand the "why" before the "how"
2. **Hands-on Practice**: You'll implement solutions with guidance
3. **Progressive Complexity**: Build up gradually as concepts become clear
4. **Question-Driven**: Ask questions to deepen understanding
5. **Mistake Learning**: Embrace errors as learning opportunities

## Current Session Notes

**Date**: [Current Date]
**Focus**: Setting up MongoDB integration
**Key Questions**: [To be filled during our sessions]
**Next Session Goals**: [To be filled during our sessions]

## Project Structure

```
src/
├── controllers/     # Business logic layer
├── models/         # Data models and schemas
├── routes/         # API endpoint definitions
├── middleware/     # Custom middleware functions
├── utils/          # Helper functions and utilities
└── index.ts        # Application entry point
```

## Tools & Technologies

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Testing**: [To be added]
- **Deployment**: [To be added]

## Notes & Commands

[Track important commands, configurations, and learnings here]

---

**Remember**: This is a learning project. Focus on understanding concepts, not just getting things working. Ask questions, experiment, and learn from mistakes!
