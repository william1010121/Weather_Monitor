# CI/CD Setup Guide

This guide will help you set up the CI/CD pipeline for this weather application using GitHub Actions.

## 🚀 Quick Setup

### 1. Repository Secrets

Go to **Settings > Secrets and variables > Actions** in your GitHub repository and add these secrets:

#### Required Secrets

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret

# Application Secrets
SECRET_KEY=your_super_secret_key_change_in_production
DB_PASSWORD=your_database_password

# Kubernetes Configuration
KUBE_CONFIG=base64_encoded_kubeconfig_file
```

#### Optional Secrets

```bash
# Container Registry (if using external registry)
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_password

# Cloud Provider Specific
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
GCP_SA_KEY=your_gcp_service_account_key
```

### 2. Generate Kubeconfig

#### For GitHub Actions

```bash
# Get your kubeconfig file
cat ~/.kube/config | base64 -w 0

# Or for MacOS
cat ~/.kube/config | base64

# Add the output to KUBE_CONFIG secret
```

### 3. Configure Environments

#### Development Environment

1. Go to **Settings > Environments**
2. Click **New environment**
3. Name: `development`
4. Add required secrets for development

#### Production Environment

1. Go to **Settings > Environments**
2. Click **New environment**
3. Name: `production`
4. Add required secrets for production

## 🏗️ Workflow Overview

### 1. CI Pipeline (`.github/workflows/ci.yml`)

- **Triggers**: Push to main/develop, PRs
- **Actions**:
  - Run backend tests with PostgreSQL
  - Run frontend tests
  - Security scanning with Trivy
  - Code coverage reporting

### 2. Docker Build (`.github/workflows/docker.yml`)

- **Triggers**: Push to main/develop, tags
- **Actions**:
  - Build backend Docker image
  - Build frontend Docker image
  - Push to GitHub Container Registry
  - Security scanning

### 3. Kubernetes Deploy (`.github/workflows/deploy.yml`)

- **Triggers**: Push to main/develop, manual dispatch
- **Actions**:
  - Deploy to development/production
  - Update secrets
  - Verify deployment

## 🔧 Environment Setup

### Development

```bash
# Environment variables for development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
REACT_APP_API_URL=http://localhost:8000
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

### Production

```bash
# Environment variables for production
ALLOWED_ORIGINS=https://weather.yourdomain.com
REACT_APP_API_URL=https://weather.yourdomain.com
GOOGLE_REDIRECT_URI=https://weather.yourdomain.com/auth/google/callback
```

## 📋 Setting Up Your Cluster

### 1. Create Namespace

```bash
kubectl create namespace weather-app
```

### 2. Create Service Account (for CI/CD)

```yaml
# service-account.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: github-actions
  namespace: weather-app
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: github-actions-role
rules:
- apiGroups: [""]
  resources: ["*"]
  verbs: ["*"]
- apiGroups: ["apps"]
  resources: ["*"]
  verbs: ["*"]
- apiGroups: ["networking.k8s.io"]
  resources: ["*"]
  verbs: ["*"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: github-actions-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: github-actions-role
subjects:
- kind: ServiceAccount
  name: github-actions
  namespace: weather-app
```

### 3. Get Service Account Token

```bash
# Create service account token
kubectl create token github-actions -n weather-app

# Or for long-lived token (Kubernetes < 1.24)
kubectl create secret generic github-actions-token \
  --from-literal=token=$(kubectl create token github-actions -n weather-app) \
  --dry-run=client -o yaml | kubectl apply -f -
```

## 🐳 GitHub Container Registry Setup

### Enable GHCR

1. Go to **Settings > Packages**
2. Ensure **GitHub Packages** is enabled
3. Set visibility to **Public** for open source projects

### Image URLs

Your images will be available at:
- Backend: `ghcr.io/your-username/weather-logger/backend:latest`
- Frontend: `ghcr.io/your-username/weather-logger/frontend:latest`

## 🔄 Manual Actions

### 1. Manual Deployment

You can manually trigger deployments:

1. Go to **Actions > Deploy to Kubernetes**
2. Click **Run workflow**
3. Select environment (development/production)

### 2. Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/backend -n weather-app
kubectl rollout undo deployment/frontend -n weather-app
```

## 📊 Monitoring

### GitHub Actions Logs

- Go to **Actions** tab in GitHub repository
- Click on workflow runs to see detailed logs
- Check **Settings > Actions > Runners** for runner status

### Kubernetes Status

```bash
# Check deployment status
kubectl get pods -n weather-app
kubectl get services -n weather-app
kubectl get ingress -n weather-app

# Check logs
kubectl logs -n weather-app deployment/backend
kubectl logs -n weather-app deployment/frontend
```

## 🚨 Troubleshooting

### Common Issues

1. **ImagePullBackOff**
   - Check if images are built and pushed
   - Verify registry credentials

2. **Kubeconfig issues**
   - Ensure KUBE_CONFIG is properly base64 encoded
   - Check cluster accessibility

3. **Secrets not found**
   - Verify all required secrets are added
   - Check secret names and keys

### Debug Commands

```bash
# Check workflow logs
gh run list
gh run view --log

# Test locally
act -j test-backend
act -j test-frontend
```

## 🔒 Security Best Practices

1. **Least Privilege**: Service account has minimal required permissions
2. **Secrets**: All sensitive data stored in GitHub Secrets
3. **Images**: Use specific tags, avoid `latest` in production
4. **Access**: Use GitHub Environments for approval workflows

## 🎯 Next Steps

1. Add monitoring (Prometheus/Grafana)
2. Add alerting (Slack/Discord notifications)
3. Add blue-green deployments
4. Add rollback automation
5. Add performance testing