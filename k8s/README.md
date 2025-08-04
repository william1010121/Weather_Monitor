# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the weather application.

## Directory Structure

```
k8s/
├── base/                    # Base manifests
├── overlays/
│   ├── development/        # Development environment
│   └── production/         # Production environment
└── README.md
```

## Quick Start

### Prerequisites
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured
- Docker images built and available

### 1. Build and Push Docker Images

```bash
# Build backend
cd backend
docker build -t weather-app-backend:latest .

# Build frontend
cd ../frontend
docker build -t weather-app-frontend:latest .

# Push to registry (if using remote cluster)
docker tag weather-app-backend:latest your-registry/weather-app-backend:latest
docker tag weather-app-frontend:latest your-registry/weather-app-frontend:latest
docker push your-registry/weather-app-backend:latest
docker push your-registry/weather-app-frontend:latest
```

### 2. Deploy to Development

```bash
# Apply development configuration
kubectl apply -k k8s/overlays/development

# Check deployment status
kubectl get pods -n weather-app
kubectl get services -n weather-app
```

### 3. Deploy to Production

```bash
# Apply production configuration
kubectl apply -k k8s/overlays/production
```

### 4. Access the Application

#### Option 1: Using kubectl port-forward (development)
```bash
# Forward frontend port
kubectl port-forward -n weather-app service/frontend 3000:3000

# Forward backend port (if needed)
kubectl port-forward -n weather-app service/backend 8000:8000
```

#### Option 2: Using Ingress (requires ingress controller)
```bash
# Add to /etc/hosts (for local development)
echo "127.0.0.1 weather-app.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 api.weather-app.local" | sudo tee -a /etc/hosts

# Access at:
# - Frontend: http://weather-app.local
# - Backend API: http://api.weather-app.local
```

## Configuration

### Secrets

Update the secrets in `k8s/base/secrets.yaml` with your actual values:

```bash
# Generate base64 encoded secrets
echo -n 'your-google-client-id' | base64
echo -n 'your-google-client-secret' | base64
echo -n 'your-secret-key' | base64
```

### Environment Variables

Modify ConfigMaps in the respective overlay directories:
- `k8s/overlays/development/config-patch.yaml`
- `k8s/overlays/production/config-patch.yaml`

## Monitoring

### Check Pod Status
```bash
kubectl get pods -n weather-app
```

### Check Logs
```bash
# Backend logs
kubectl logs -n weather-app deployment/backend

# Frontend logs
kubectl logs -n weather-app deployment/frontend

# PostgreSQL logs
kubectl logs -n weather-app deployment/postgres
```

### Check Services
```bash
kubectl get services -n weather-app
```

## Cleanup

```bash
# Remove all resources
kubectl delete namespace weather-app

# Or using kustomize
kubectl delete -k k8s/overlays/development
```

## Troubleshooting

### Common Issues

1. **ImagePullBackOff**: Ensure images are available in the registry
2. **CrashLoopBackOff**: Check logs for application errors
3. **Pending Pods**: Check resource constraints and node availability
4. **Service Connection Issues**: Verify service discovery and DNS

### Debug Commands

```bash
# Describe pod
kubectl describe pod <pod-name> -n weather-app

# Get events
kubectl get events -n weather-app --sort-by=.metadata.creationTimestamp

# Shell into pod
kubectl exec -it <pod-name> -n weather-app -- /bin/bash
```

## Production Considerations

- Use external database service (Cloud SQL, RDS, etc.)
- Configure Horizontal Pod Autoscaler (HPA)
- Set up proper monitoring and alerting
- Use cert-manager for SSL/TLS certificates
- Configure network policies
- Use persistent volumes with proper backup
- Implement proper secrets management (external-secrets, sealed-secrets)