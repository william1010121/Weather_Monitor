# Weather Observation Logger / 人工氣象觀測紀錄器

A comprehensive weather observation logging system with Chinese UI support for manual weather data collection and management.

## Features

- **Data Entry Form**: Comprehensive weather observation form with Chinese labels
- **Dashboard**: Real-time display of latest observation data
- **User Management**: Google OAuth authentication with admin controls
- **Record Management**: Edit and manage historical observations
- **Conditional Data Sections**: Dynamic form sections for evaporation pan maintenance

## Tech Stack

- **Frontend**: React, Material-UI, i18next (localization)
- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: PostgreSQL
- **Authentication**: Google OAuth2
- **Environment Management**: uv (Python), npm (Node.js)
- **Containerization**: Docker
- **Testing**: pytest, React Testing Library

## Project Structure

```
weather-logger/
├── backend/              # Python FastAPI backend
│   ├── src/             # Source code
│   ├── tests/           # Unit tests
│   ├── pyproject.toml   # uv project configuration
│   ├── Dockerfile       # Backend container
│   └── .env.example     # Backend environment template
├── frontend/            # React frontend
│   ├── src/             # Source code
│   ├── public/          # Static assets
│   ├── package.json     # npm dependencies
│   ├── Dockerfile       # Frontend container
│   └── .env.example     # Frontend environment template
├── docker-compose.yml   # Docker orchestration
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js 18+** - For frontend development
- **Python 3.11+** - For backend development
- **uv** - Python environment and dependency management
- **PostgreSQL** - Database (or use Docker)
- **Docker** (optional) - For containerized deployment

### Installation

#### Method 1: Local Development (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weather-logger
   ```

2. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit the .env files with your configuration
   # You need to set up Google OAuth credentials
   ```

3. **Set up PostgreSQL Database**
   ```bash
   # Option A: Using Docker (easiest)
   docker run --name weather-postgres -e POSTGRES_DB=weather_db -e POSTGRES_USER=weather_user -e POSTGRES_PASSWORD=weather_password -p 5432:5432 -d postgres:15
   
   # Option B: Local PostgreSQL installation
   # Create database manually: weather_db
   # Create user: weather_user with password: weather_password
   ```

4. **Backend Setup (using uv)**
   ```bash
   cd backend
   
   # Install uv if not already installed
   pip install uv
   
   # Install dependencies (uv will create virtual environment automatically)
   uv sync
   
   # Run database migrations
   uv run alembic upgrade head
   
   # Start the backend server
   uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Frontend Setup (using npm)**
   ```bash
   # Open a new terminal
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start the development server
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

#### Method 2: Docker Deployment

1. **Clone and configure**
   ```bash
   git clone <repository-url>
   cd weather-logger
   cp .env.example .env
   # Edit .env with your Google OAuth credentials
   ```

2. **Run with Docker Compose**
   ```bash
   # Build and start all services
   docker-compose up --build
   
   # Or run in background
   docker-compose up -d --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## Development Commands

### Backend Commands (using uv)

```bash
cd backend

# Install dependencies
uv sync

# Add new dependency
uv add package-name

# Add development dependency
uv add --dev package-name

# Run the server
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=src --cov-report=html

# Run database migrations
uv run alembic upgrade head

# Generate new migration
uv run alembic revision --autogenerate -m "migration message"

# Run linting (if configured)
uv run ruff check src/
```

### Frontend Commands (using npm)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run linting
npm run lint

# Type checking (if TypeScript)
npm run type-check
```

## Environment Configuration

### Backend Environment Variables (.env)

```bash
# Database Configuration
DATABASE_URL=postgresql://weather_user:weather_password@localhost:5432/weather_db

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# JWT Configuration
SECRET_KEY=your_super_secret_key_here_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Environment
ENVIRONMENT=development
DEBUG=true
```

### Frontend Environment Variables (.env)

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# Environment
REACT_APP_ENVIRONMENT=development
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8000/auth/google/callback` (for backend)
   - `http://localhost:3000` (for frontend)
6. Copy Client ID and Client Secret to your `.env` files

## Database Migrations

The project uses Alembic for database migrations:

```bash
cd backend

# Create new migration after model changes
uv run alembic revision --autogenerate -m "description of changes"

# Apply migrations
uv run alembic upgrade head

# Downgrade to previous migration
uv run alembic downgrade -1

# View migration history
uv run alembic history
```

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
uv run pytest

# Run with coverage report
uv run pytest --cov=src --cov-report=html --cov-report=term

# Run specific test file
uv run pytest tests/test_observations.py

# Run tests with verbose output
uv run pytest -v
```

### Frontend Testing

```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test -- ObservationsList.test.js
```

## First Admin Setup

1. Start the application and visit http://localhost:3000
2. Login with your Google account
3. The first user needs to be manually set as admin in the database:
   ```sql
   UPDATE users SET is_admin = true WHERE email = 'your-email@gmail.com';
   ```
4. After that, use the Admin Panel to manage other users

## Production Deployment

### Using Docker

1. Set production environment variables in `.env`
2. Build and deploy:
   ```bash
   docker-compose -f docker-compose.yml up --build -d
   ```

### Manual Deployment

1. **Backend**:
   ```bash
   cd backend
   uv sync
   uv run uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm run build
   # Serve the build folder with nginx or similar
   ```

## Troubleshooting

### Common Issues

1. **Backend fails to start**:
   - Check PostgreSQL is running and accessible
   - Verify environment variables in `backend/.env`
   - Check if port 8000 is available

2. **Frontend fails to start**:
   - Run `npm install` to ensure dependencies are installed
   - Check if port 3000 is available
   - Verify REACT_APP_API_URL points to backend

3. **Authentication fails**:
   - Verify Google OAuth credentials are correct
   - Check authorized redirect URIs in Google Console
   - Ensure backend and frontend have matching client IDs

4. **Database connection issues**:
   - Verify PostgreSQL is running
   - Check DATABASE_URL in backend/.env
   - Run migrations: `uv run alembic upgrade head`

### Development Tips

- Use `uv run` prefix for all Python commands in the backend
- Frontend hot-reload works automatically with `npm start`
- Backend auto-reload works with `--reload` flag
- Check browser network tab for API call debugging
- Use `docker-compose logs service-name` for container debugging

## License

This project is licensed under the MIT License.