import pytest
from unittest.mock import patch, MagicMock

class TestAuth:
    
    def test_google_login(self, client):
        response = client.get("/auth/google")
        assert response.status_code == 200
        
        data = response.json()
        assert "authorization_url" in data
        assert "state" in data
        assert "accounts.google.com" in data["authorization_url"]

    @patch('src.api.auth.httpx.AsyncClient')
    @patch('src.api.auth.OAuth2Session')
    def test_google_callback_new_user(self, mock_oauth, mock_httpx, client, db_session):
        # Mock OAuth2Session
        mock_oauth_instance = MagicMock()
        mock_oauth.return_value = mock_oauth_instance
        mock_oauth_instance.fetch_token.return_value = {"access_token": "fake_token"}
        
        # Mock httpx response
        mock_client = MagicMock()
        mock_httpx.return_value.__aenter__.return_value = mock_client
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "id": "google_user_123",
            "email": "newuser@example.com",
            "name": "New User",
            "picture": "https://example.com/photo.jpg"
        }
        mock_client.get.return_value = mock_response
        
        response = client.get("/auth/google/callback?code=fake_code&state=fake_state")
        assert response.status_code == 302  # Redirect
        assert "localhost:3000" in response.headers["location"]

    def test_google_callback_missing_code(self, client):
        response = client.get("/auth/google/callback?state=fake_state")
        assert response.status_code == 422  # Validation error

    def test_verify_google_token_new_user(self, client, db_session):
        token_data = {
            "google_id": "google_123",
            "email": "test@example.com",
            "name": "Test User",
            "picture": "https://example.com/photo.jpg"
        }
        
        response = client.post("/auth/google/verify", json=token_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == "test@example.com"

    def test_verify_google_token_existing_user(self, client, test_user, db_session):
        token_data = {
            "google_id": test_user.google_id,
            "email": test_user.email,
            "name": "Updated Name",
            "picture": "https://example.com/new_photo.jpg"
        }
        
        response = client.post("/auth/google/verify", json=token_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["user"]["google_name"] == "Updated Name"

    def test_verify_google_token_missing_data(self, client):
        token_data = {
            "google_id": "google_123",
            "email": "test@example.com"
            # Missing name
        }
        
        response = client.post("/auth/google/verify", json=token_data)
        assert response.status_code == 400

    def test_logout(self, client):
        response = client.post("/auth/logout")
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data