#!/bin/bash

# Kubernetes deployment script for weather application

set -e

ENVIRONMENT=${1:-development}
NAMESPACE="weather-app"

echo "🚀 Deploying weather application to $ENVIRONMENT environment"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster"
    exit 1
fi

# Create namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Build images if running locally
if [[ "$ENVIRONMENT" == "development" ]]; then
    echo "🏗️  Building Docker images..."
    
    # Build backend
    echo "Building backend..."
    docker build -t weather-app-backend:latest ./backend
    
    # Build frontend
    echo "Building frontend..."
    docker build -t weather-app-frontend:latest ./frontend
fi

# Deploy using kustomize
echo "📦 Applying Kubernetes manifests..."
kubectl apply -k k8s/overlays/$ENVIRONMENT

# Wait for deployments to be ready
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n $NAMESPACE
kubectl wait --for=condition=available --timeout=300s deployment/backend -n $NAMESPACE
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n $NAMESPACE

echo "✅ Deployment complete!"

# Display service information
echo "📋 Services:"
kubectl get services -n $NAMESPACE

# Display ingress information
if kubectl get ingress -n $NAMESPACE &> /dev/null; then
    echo "🔗 Ingress:"
    kubectl get ingress -n $NAMESPACE
fi

echo ""
echo "🌐 Access your application:"
if [[ "$ENVIRONMENT" == "development" ]]; then
    echo "  Frontend: kubectl port-forward -n $NAMESPACE service/frontend 3000:3000"
    echo "  Backend:  kubectl port-forward -n $NAMESPACE service/backend 8000:8000"
else
    echo "  Check ingress configuration for production access"
fi

echo ""
echo "📊 Monitor deployment:"
echo "  kubectl get pods -n $NAMESPACE"
echo "  kubectl logs -n $NAMESPACE deployment/backend"
echo "  kubectl logs -n $NAMESPACE deployment/frontend"