# HAPO SIMPLE OKR

A comprehensive OKR (Objectives and Key Results) management system built with Next.js 15, providing a multi-language interface for managing objectives from company level to individual level.

## Features

- Multi-language support (English, Vietnamese, German, Japanese)
- Authentication using NextAuth with Google login
- User profile management
- Objectives management with different types (company, department, personal)
- Department hierarchy management with parent-child relationships
- Reports and statistics for tracking OKR progress
- User management with department assignments and primary department designation
- Role-based access control (Admin, Manager, User)
- Responsive design with Tailwind CSS
- Department-specific roles (Member, Leader, Manager)

## System Requirements

- Node.js 18.x or higher
- PostgreSQL (optional, currently using mock data)
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

4. Start the application:
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
  ├── app/                 # App directory (Next.js App Router)
  │   ├── [lang]/          # Language-specific routes
  │   │   ├── page.tsx     # Homepage
  │   │   ├── objectives/  # Objectives management
  │   │   ├── departments/ # Departments management
  │   │   ├── reports/     # Reports and statistics
  │   │   ├── users/       # User management
  │   │   └── profile/     # User profile
  │   └── api/             # API routes
  │       ├── auth/        # Authentication endpoints
  │       ├── objectives/  # Objectives endpoints
  │       ├── departments/ # Departments endpoints
  │       ├── reports/     # Reports endpoints
  │       ├── users/       # Users endpoints
  │       └── user-departments/ # User-department relationship endpoints
  ├── components/          # Shared components
  │   ├── Header.tsx       # Navigation header
  │   ├── LanguageSelector.tsx # Language selection
  │   └── ...
  ├── i18n/                # Internationalization
  │   ├── config.ts        # i18n configuration
  │   └── locales/         # Language files
  │       ├── en.json      # English
  │       ├── vi.json      # Vietnamese
  │       ├── de.json      # German
  │       └── ja.json      # Japanese
  ├── hooks/               # Custom React hooks
  │   ├── useLanguage.ts   # Language management hook
  │   └── ...
  └── lib/                 # Utility functions
      ├── dictionary.ts    # Dictionary loader for i18n
      └── ...
```

## Usage

1. Access `http://localhost:3000` (will redirect to `http://localhost:3000/en` for English)
2. Login with Google account
3. Navigate to various sections:
   - **Objectives**: Create and manage objectives and key results
   - **Departments**: Manage department hierarchy
   - **Reports**: View statistics and reports
   - **Users**: Manage users and their department assignments
   - **Profile**: View and manage your profile

## Features in Detail

### Multi-language Support
The application supports multiple languages with dedicated routes using the format `/{lang}/...` for all pages. You can switch between languages using the language selector in the header. Currently supported languages are:
- English (en)
- Vietnamese (vi)
- German (de)
- Japanese (ja)

### User Profile
View your personal information and profile picture in the Profile section accessible from the user menu in the header.

### Objectives Management
Create, view, edit, and delete objectives. Track progress with key results and filter objectives by type, status, and priority. Objectives can be company-wide, department-specific, or personal.

### Department Management
Create and manage department hierarchies with parent-child relationships. Each department can have a description and assigned users with specific roles within the department.

### Reports and Statistics
View performance metrics including:
- Total objectives count
- Active objectives count
- Completed objectives count
- Progress charts by department
- Monthly progress tracking
- Time range filtering (month, quarter, year)

### User Management
Manage users with the following features:
- View all users in the system
- Assign users to departments with specific roles (Member, Leader, Manager)
- Designate a primary department for each user
- Filter users by role and department
- Search for users by name or email
- Current user highlighting

## API Endpoints

The system provides the following API endpoints:

- `/api/objectives` - Manage objectives (GET, POST, PUT, DELETE)
- `/api/departments` - Manage departments (GET, POST, PUT, DELETE)
- `/api/reports` - Generate and retrieve reports (GET, POST)
- `/api/users` - Manage users (GET, POST, PUT, DELETE)
- `/api/user-departments` - Manage user-department relationships (GET, POST, PUT, DELETE)

## Contribution

All contributions are welcome! Please create an issue or pull request to contribute to the project.

## License

MIT
