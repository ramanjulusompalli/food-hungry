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

## Step 2: Create Supabase Database

Create a Supabase project, then copy the PostgreSQL connection details.

For `user-service`, set these environment variables in your backend host:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://YOUR_SUPABASE_HOST:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=YOUR_SUPABASE_DATABASE_PASSWORD
```

Supabase may also show a connection pooler URL. Use the direct/session connection for Spring Boot first.

The `user-service` will automatically create this table on startup:

```text
app_users
```

It also inserts this demo user if it does not exist:

```text
customer@foodhungry.com / password123
```

## Step 3: Deploy Backend Services

Deploy these four services separately:

```text
restaurant-service
order-service
user-service
api-gateway
```

Use the backend Dockerfile:

```text
backend/Dockerfile
```

Set build argument per service:

```text
SERVICE_NAME=restaurant-service
SERVICE_NAME=order-service
SERVICE_NAME=user-service
SERVICE_NAME=api-gateway
```

For `user-service`, also configure the datasource environment variables from Step 2.

After deploying the first three services, configure API Gateway environment variables:

```text
SERVICES_RESTAURANT_URL=https://your-restaurant-service-url
SERVICES_ORDER_URL=https://your-order-service-url
SERVICES_USER_URL=https://your-user-service-url
```

The cloud provider will usually set `PORT` automatically. The app already supports that.

## Step 4: Deploy Frontend To Cloudflare Pages

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

## Step 5: Test Production

Open your Cloudflare Pages URL and check:

- Restaurants load from backend.
- Register opens at the top when placing an order.
- Login works.
- Place order calls the order service.

## Important Current Limitation

Right now `order-service` uses in-memory `ArrayList`.

That means:

- Orders reset whenever the order service restarts.
- User registration/login is now ready for PostgreSQL.
- Later we should add PostgreSQL persistence for orders and restaurants too.
