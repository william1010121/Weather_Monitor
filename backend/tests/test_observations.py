import pytest
from datetime import datetime
from src.models.observation_model import Observation

class TestObservations:
    
    def test_create_observation(self, client, auth_headers):
        observation_data = {
            "observation_time": "2024-01-15T10:00:00",
            "temperature": 25.5,
            "wet_bulb_temperature": 22.0,
            "precipitation": 0.0,
            "evaporation_pan_temp": 24.0,
            "current_evaporation_level": 150.0,
            "current_weather_code": "01",
            "total_cloud_amount": 2,
            "high_cloud_type_code": 1,
            "high_cloud_amount": 1,
            "middle_cloud_type_code": 0,
            "middle_cloud_amount": 0,
            "low_cloud_type_code": 2,
            "low_cloud_amount": 1,
            "has_cleaned_evaporation_pan": False,
            "has_added_evaporation_water": False,
            "has_reduced_evaporation_water": False,
            "notes": "Clear morning observation"
        }
        
        response = client.post("/observations/", json=observation_data, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["temperature"] == 25.5
        assert data["notes"] == "Clear morning observation"
        assert "id" in data
        assert "observer_id" in data

    def test_create_observation_unauthorized(self, client):
        observation_data = {
            "observation_time": "2024-01-15T10:00:00",
            "temperature": 25.5
        }
        
        response = client.post("/observations/", json=observation_data)
        assert response.status_code == 401

    def test_get_observations(self, client, auth_headers, test_user, db_session):
        # Create test observation
        observation = Observation(
            observation_time=datetime(2024, 1, 15, 10, 0),
            observer_id=test_user.id,
            temperature=25.5,
            notes="Test observation"
        )
        db_session.add(observation)
        db_session.commit()
        
        response = client.get("/observations/", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["temperature"] == 25.5

    def test_get_observation_by_id(self, client, auth_headers, test_user, db_session):
        # Create test observation
        observation = Observation(
            observation_time=datetime(2024, 1, 15, 10, 0),
            observer_id=test_user.id,
            temperature=25.5,
            notes="Test observation"
        )
        db_session.add(observation)
        db_session.commit()
        db_session.refresh(observation)
        
        response = client.get(f"/observations/{observation.id}", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["temperature"] == 25.5
        assert data["notes"] == "Test observation"

    def test_get_observation_not_found(self, client, auth_headers):
        response = client.get("/observations/999", headers=auth_headers)
        assert response.status_code == 404

    def test_update_observation(self, client, auth_headers, test_user, db_session):
        # Create test observation
        observation = Observation(
            observation_time=datetime(2024, 1, 15, 10, 0),
            observer_id=test_user.id,
            temperature=25.5,
            notes="Original note"
        )
        db_session.add(observation)
        db_session.commit()
        db_session.refresh(observation)
        
        update_data = {
            "temperature": 26.0,
            "notes": "Updated note"
        }
        
        response = client.put(f"/observations/{observation.id}", json=update_data, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["temperature"] == 26.0
        assert data["notes"] == "Updated note"

    def test_delete_observation(self, client, auth_headers, test_user, db_session):
        # Create test observation
        observation = Observation(
            observation_time=datetime(2024, 1, 15, 10, 0),
            observer_id=test_user.id,
            temperature=25.5
        )
        db_session.add(observation)
        db_session.commit()
        db_session.refresh(observation)
        
        response = client.delete(f"/observations/{observation.id}", headers=auth_headers)
        assert response.status_code == 200
        
        # Verify deletion
        response = client.get(f"/observations/{observation.id}", headers=auth_headers)
        assert response.status_code == 404

    def test_access_other_user_observation_forbidden(self, client, auth_headers, admin_user, db_session):
        # Create observation for admin user
        observation = Observation(
            observation_time=datetime(2024, 1, 15, 10, 0),
            observer_id=admin_user.id,
            temperature=25.5
        )
        db_session.add(observation)
        db_session.commit()
        db_session.refresh(observation)
        
        # Try to access with regular user token
        response = client.get(f"/observations/{observation.id}", headers=auth_headers)
        assert response.status_code == 403

    def test_admin_can_access_all_observations(self, client, admin_headers, test_user, db_session):
        # Create observation for regular user
        observation = Observation(
            observation_time=datetime(2024, 1, 15, 10, 0),
            observer_id=test_user.id,
            temperature=25.5
        )
        db_session.add(observation)
        db_session.commit()
        db_session.refresh(observation)
        
        # Access with admin token
        response = client.get(f"/observations/{observation.id}", headers=admin_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["temperature"] == 25.5