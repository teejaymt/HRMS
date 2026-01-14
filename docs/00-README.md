# HRMS Agent Instructions

This directory contains comprehensive coding standards and guidelines for LLM agents working on the HRMS (Human Resource Management System) project.

## 📋 Table of Contents

1. [Project Overview & Architecture](01-project-overview.md)
2. [Backend Coding Standards (NestJS)](02-backend-standards.md)
3. [Frontend Coding Standards (Next.js)](03-frontend-standards.md)
4. [Database & Prisma Conventions](04-database-standards.md)
5. [API Design Conventions](05-api-standards.md)
6. [Saudi Compliance Guidelines](06-saudi-compliance.md)
7. [File Structure & Naming Conventions](07-file-structure.md)
8. [Testing Standards](08-testing-standards.md)
9. [Security Best Practices](09-security-standards.md)
10. [Error Handling & Logging](10-error-handling.md)

## 🎯 Purpose

These documents provide:
- Consistent coding patterns for AI agents to follow
- Project-specific architectural decisions
- Business domain context (Saudi Arabia HRMS compliance)
- Best practices for maintainability and scalability

## 🚀 Quick Start for Agents

When working on this project:

1. **Always read** the relevant standards document before implementing features
2. **Follow** the established patterns and conventions
3. **Maintain** consistency with existing code
4. **Consider** Saudi labor law compliance for all employee-related features
5. **Test** your changes thoroughly

## 📌 Key Project Facts

- **Backend**: NestJS with TypeScript
- **Frontend**: Next.js 16 with React 19 and TypeScript
- **Database**: SQLite with Prisma ORM (PostgreSQL ready)
- **Deployment Region**: Saudi Arabia
- **Compliance**: Saudi Labor Law compliant
- **Authentication**: JWT-based with role-based access control

## ⚠️ Critical Reminders

- **All employee data must support Arabic fields** for Saudi compliance
- **Date fields should have Hijri calendar equivalents** where applicable
- **GOSI and Iqama tracking** are mandatory for expat employees
- **Nitaqat/Saudization tracking** must be maintained for Saudi nationals
- **API responses must include proper error messages** in both English and Arabic

## 🔄 Updates

When patterns evolve or new conventions are established, update these documents to maintain a single source of truth.

---

**Version**: 1.0  
**Last Updated**: January 2026  
**Author**: HRMS Development Team
