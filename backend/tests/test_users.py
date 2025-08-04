import pytest

class TestUsers:
    
    def test_get_current_user(self, client, auth_headers, test_user):
        response = client.get("/users/me", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["email"] == test_user.email
        assert data["google_name"] == test_user.google_name
        assert data["is_admin"] == test_user.is_admin

    def test_get_current_user_unauthorized(self, client):
        response = client.get("/users/me")
        assert response.status_code == 401

    def test_get_users_admin_only(self, client, admin_headers):
        response = client.get("/users/", headers=admin_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)

    def test_get_users_forbidden_for_regular_user(self, client, auth_headers):
        response = client.get("/users/", headers=auth_headers)
        assert response.status_code == 403

    def test_get_user_by_id_admin_only(self, client, admin_headers, test_user):
        response = client.get(f"/users/{test_user.id}", headers=admin_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["email"] == test_user.email

    def test_get_user_by_id_not_found(self, client, admin_headers):
        response = client.get("/users/999", headers=admin_headers)
        assert response.status_code == 404

    def test_update_user_admin_only(self, client, admin_headers, test_user):
        update_data = {
            "display_name": "New Display Name",
            "is_active": True
        }
        
        response = client.put(f"/users/{test_user.id}", json=update_data, headers=admin_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["display_name"] == "New Display Name"

    def test_deactivate_user(self, client, admin_headers, test_user):
        response = client.delete(f"/users/{test_user.id}", headers=admin_headers)
        assert response.status_code == 200

    def test_cannot_deactivate_self(self, client, admin_headers, admin_user):
        response = client.delete(f"/users/{admin_user.id}", headers=admin_headers)
        assert response.status_code == 400

    def test_activate_user(self, client, admin_headers, test_user, db_session):
        # First deactivate user
        test_user.is_active = False
        db_session.commit()
        
        response = client.post(f"/users/{test_user.id}/activate", headers=admin_headers)
        assert response.status_code == 200

    def test_make_admin(self, client, admin_headers, test_user):
        response = client.post(f"/users/{test_user.id}/make-admin", headers=admin_headers)
        assert response.status_code == 200

    def test_remove_admin(self, client, admin_headers, test_user, db_session):
        # First make user admin
        test_user.is_admin = True
        db_session.commit()
        
        response = client.delete(f"/users/{test_user.id}/remove-admin", headers=admin_headers)
        assert response.status_code == 200

    def test_cannot_remove_admin_from_self(self, client, admin_headers, admin_user):
        response = client.delete(f"/users/{admin_user.id}/remove-admin", headers=admin_headers)
        assert response.status_code == 400