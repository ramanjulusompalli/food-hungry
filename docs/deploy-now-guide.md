# Food Hungry Deployment Guide

This is the first deployment plan for the current working version.

## Recommended First Deployment

- Frontend web app: Cloudflare Pages
- Backend Spring Boot services: Render, Koyeb, Railway, or another Java/Docker-friendly host
- Database: not needed yet because current data is stored in memory with `ArrayList`

Cloudflare Pages is excellent for the Expo web frontend. For Spring Boot services, use a Java/Docker host because Cloudflare Workers is not the right fit for Java microservices on the free plan.

## Step 1: Push Code To GitHub

Upload this folder to GitHub:

```text
C:\Users\raman\Documents\Codex\2026-06-15\hi-i-want-to-create-one\work\food-hungry
```

Do not upload `node_modules`, `target`, `.expo`, or `.idea`.

## Step 2: Deploy Backend Services

Deploy these four services separately:

```text
restaurant-service
order-service
user-service
api-gateway
```

Use the backend Dockerfile for each service:

```text
backend/Dockerfile.restaurant-service
backend/Dockerfile.order-service
backend/Dockerfile.user-service
backend/Dockerfile.api-gateway
```

In Render, leave root directory empty:

```text
Root Directory: empty
```

Set Docker build context directory:

```text
.
```

Then set Dockerfile path for each service from the repository root:

```text
backend/Dockerfile.restaurant-service
backend/Dockerfile.order-service
backend/Dockerfile.user-service
backend/Dockerfile.api-gateway
```

No Docker build arguments are required when using these service-specific Dockerfiles.

For this demo version, `user-service` uses in-memory `ArrayList`, so no database environment variables are required.

After deploying the first three services, configure API Gateway environment variables:

```text
SERVICES_RESTAURANT_URL=https://your-restaurant-service-url
SERVICES_ORDER_URL=https://your-order-service-url
SERVICES_USER_URL=https://your-user-service-url
```

The cloud provider will usually set `PORT` automatically. The app already supports that.

## Step 3: Deploy Frontend To Cloudflare Pages

In Cloudflare dashboard:

1. Go to Workers & Pages.
2. Create application.
3. Choose Pages.
4. Connect GitHub repository.
5. Select the Food Hungry repository.
6. Set root directory:

```text
app
```

7. Set build command:

```text
npm run build:web
```

8. Set build output directory:

```text
dist
```

9. Add environment variable:

```text
EXPO_PUBLIC_API_URL=https://your-api-gateway-url
```

10. Deploy.

## Step 4: Test Production

Open your Cloudflare Pages URL and check:

- Restaurants load from backend.
- Register opens at the top when placing an order.
- Login works.
- Place order calls the order service.

## Important Current Limitation

Right now `user-service` and `order-service` use in-memory `ArrayList`.

That means:

- Registered users and orders reset whenever services restart.
- This is okay for demo deployment.
- Later we should add PostgreSQL persistence for users, orders, and restaurants.
