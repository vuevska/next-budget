# Next Budget

A modern budget management application built with Next.js that helps you track your finances, manage transactions, and stay on top of your budget goals.

## Features

- **Account Management**: Track multiple account types and their balances
- **Transaction Tracking**: Record income and expenses with detailed categorization
- **Budget Planning**: Set monthly budgets across different categories and subcategories
- **User Authentication**: Secure login system with session management
- **Real-time Updates**: Live budget calculations and spending insights

## Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Radix UI**
- **React Icons**

### Backend & Database

- **NextAuth.js** - Authentication
- **Prisma** - Database ORM
- **MySQL** - Database provider
- **Zod** - Schema validation

### Additional Libraries

- **@dnd-kit** - Drag and drop functionality
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Classnames** - Conditional CSS classes

## Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users** - User accounts and authentication
- **Account Types** - Different types of financial accounts
- **Categories & Subcategories** - Budget organization
- **Transactions** - Financial transactions with categorization
- **Periods** - Monthly budget periods
- **Payees** - Transaction recipients
