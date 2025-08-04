# Development Guide

## Quick Start

### Automatic Setup (Recommended)

```bash
# Make the script executable (first time only)
chmod +x start-dev.sh

# Start both frontend and backend
./start-dev.sh
```

This script will:
1. Check for required tools (uv, node, npm, docker)
2. Create environment files from templates if missing
3. Start PostgreSQL container if not running
4. Install dependencies for both frontend and backend
5. Run database migrations
6. Start both servers with hot-reload

### Manual Setup

If you prefer to run each component separately:

#### Terminal 1: Database
```bash
# Start PostgreSQL (if not using Docker Compose)
docker run --name weather-postgres \
  -e POSTGRES_DB=weather_db \
  -e POSTGRES_USER=weather_user \
  -e POSTGRES_PASSWORD=weather_password \
  -p 5432:5432 \
  -d postgres:15
```

#### Terminal 2: Backend
```bash
cd backend

# Install dependencies (first time)
uv sync

# Run migrations
uv run alembic upgrade head

# Start server with hot-reload
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Terminal 3: Frontend
```bash
cd frontend

# Install dependencies (first time)
npm install

# Start development server
npm start
```

## Development Workflow

### Adding New Features

1. **Backend Changes**:
   ```bash
   cd backend
   
   # Add new dependencies
   uv add package-name
   
   # Create database migration after model changes
   uv run alembic revision --autogenerate -m "description"
   
   # Apply migration
   uv run alembic upgrade head
   
   # Run tests
   uv run pytest
   ```

2. **Frontend Changes**:
   ```bash
   cd frontend
   
   # Add new dependencies
   npm install package-name
   
   # Run tests
   npm test
   
   # Build for production testing
   npm run build
   ```

### Database Operations

```bash
cd backend

# Create new migration
uv run alembic revision --autogenerate -m "add new table"

# Apply migrations
uv run alembic upgrade head

# Rollback migration
uv run alembic downgrade -1

# View migration history
uv run alembic history

# Reset database (development only)
uv run alembic downgrade base
uv run alembic upgrade head
```

### Testing

```bash
# Backend tests
cd backend
uv run pytest --cov=src --cov-report=html

# Frontend tests
cd frontend
npm test -- --coverage --watchAll=false
```

### Code Quality

```bash
# Backend linting (if configured)
cd backend
uv run ruff check src/
uv run ruff format src/

# Frontend linting
cd frontend
npm run lint
npm run lint:fix
```

## Environment Variables

### Required Configuration

Before starting development, you need to configure:

1. **Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add to `.env`, `backend/.env`, and `frontend/.env`

2. **Database Connection**:
   - The default PostgreSQL settings should work with Docker
   - Modify `DATABASE_URL` if using different settings

3. **Security Keys**:
   - Generate a secure `SECRET_KEY` for JWT tokens
   - Change default passwords in production

### Environment Files

- `.env` - Root environment (Docker Compose)
- `backend/.env` - Backend API configuration
- `frontend/.env` - Frontend React app configuration

## Debugging

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check what's using ports
   lsof -i :3000  # Frontend
   lsof -i :8000  # Backend
   lsof -i :5432  # PostgreSQL
   ```

2. **Database connection**:
   ```bash
   # Test PostgreSQL connection
   docker exec -it weather-postgres psql -U weather_user -d weather_db
   ```

3. **Backend API errors**:
   - Check logs in terminal running uvicorn
   - Visit http://localhost:8000/docs for API documentation
   - Check database migrations: `uv run alembic current`

4. **Frontend API calls**:
   - Check browser Network tab
   - Verify REACT_APP_API_URL in frontend/.env
   - Check CORS settings in backend

### Logs and Monitoring

```bash
# View Docker container logs
docker logs weather-postgres

# Backend logs are shown in terminal where uvicorn runs
# Frontend logs are shown in terminal where npm start runs

# Database queries (development)
# Enable SQL logging in backend/src/core/database.py:
# engine = create_engine(DATABASE_URL, echo=True)
```

## Project Structure

```
backend/
├── src/
│   ├── api/           # FastAPI route handlers
│   ├── core/          # Configuration, database, security
│   ├── models/        # SQLAlchemy database models
│   ├── schemas/       # Pydantic data validation
│   └── middleware/    # Authentication middleware
├── tests/             # Unit tests
├── alembic/           # Database migrations
├── main.py            # FastAPI application entry point
└── pyproject.toml     # uv project configuration

frontend/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable React components
│   ├── pages/         # Route components
│   ├── context/       # React context providers
│   ├── services/      # API service functions
│   └── locales/       # i18n translations
├── package.json       # npm dependencies
└── Dockerfile        # Production container
```

## Contributing

1. Create feature branch from main
2. Implement changes with tests
3. Run full test suite
4. Update documentation if needed
5. Create pull request

### Code Style

- **Backend**: Follow PEP 8, use type hints
- **Frontend**: Use Prettier, follow React best practices
- **Commit messages**: Use conventional commits format

### Pull Request Checklist

- [ ] Tests pass: `uv run pytest` and `npm test`
- [ ] Code is properly formatted
- [ ] Documentation is updated
- [ ] Environment variables are documented
- [ ] Database migrations are included (if applicable)
- [ ] No secrets committed to repository