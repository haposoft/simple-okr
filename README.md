# OKR Management System

A web application for managing OKR (Objectives and Key Results) built with Next.js, allowing management of objectives from company level to individual level.

## Features

- Login with Google account
- Manage objectives and key results
- Hierarchy of objectives from company to department and individual
- Track and update progress of objectives
- User-friendly interface with Tailwind CSS

## System Requirements

- Node.js 18.x or higher
- PostgreSQL
- Google Cloud Platform account (for Google login)

## Installation

1. Clone repository:
```bash
git clone <repository-url>
cd simple-okr
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file and configure environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/okr_db"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

4. Create database and run migrations:
```bash
npx prisma migrate dev
```

5. Start the application:
```bash
npm run dev
```

## Google OAuth Configuration

1. Access [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google OAuth API
4. Create credentials (OAuth 2.0 Client ID)
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to .env file

## Project Structure

```
src/
  ├── app/
  │   ├── api/           # API endpoints
  │   ├── components/    # React components
  │   ├── objectives/    # Objectives management page
  │   └── departments/   # Departments management page
  ├── prisma/           # Database schema and migrations
  └── styles/           # Global styles
```

## Usage

1. Access `http://localhost:3000`
2. Login with Google account
3. Create a new department
4. Create objectives for company, department, or individual
5. Track and update progress of objectives

## Contribution

All contributions are welcome! Please create an issue or pull request to contribute to the project.

## License

MIT
