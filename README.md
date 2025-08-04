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
- **Containerization**: Docker
- **Testing**: pytest, React Testing Library

## Project Structure

```
weather-logger/
├── backend/          # Python FastAPI backend
├── frontend/         # React frontend
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+
- Python 3.9+
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository
2. Set up backend dependencies: `cd backend && pip install -r requirements.txt`
3. Set up frontend dependencies: `cd frontend && npm install`
4. Configure environment variables in `.env`
5. Run database migrations
6. Start the development servers

## Development

- Backend: `cd backend && uvicorn main:app --reload`
- Frontend: `cd frontend && npm start`

## Testing

- Backend: `cd backend && pytest`
- Frontend: `cd frontend && npm test`

## Environment Variables

Create a `.env` file in the backend directory with:

```
DATABASE_URL=postgresql://user:password@localhost/weather_db
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SECRET_KEY=your_secret_key
```

## License

This project is licensed under the MIT License.