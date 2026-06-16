# Food Hungry Local Run Guide

## What We Are Running

Locally, your machine will run five apps:

```text
Food Hungry Expo App  ->  API Gateway  ->  Restaurant Service
                                   \
                                    ->  Order Service
                                   \
                                    ->  User Service
```

## Step 1: Backend

Open four backend terminals from:

```text
C:\Users\raman\Documents\Codex\2026-06-15\hi-i-want-to-create-one\work\food-hungry\backend
```

Run:

```powershell
mvn spring-boot:run -pl restaurant-service
```

```powershell
mvn spring-boot:run -pl order-service
```

```powershell
mvn spring-boot:run -pl user-service
```

```powershell
mvn spring-boot:run -pl api-gateway
```

Check:

```text
http://localhost:8080/api/restaurants
```

Check users:

```text
http://localhost:8084/users
```

## Local Database For User Service

`user-service` now uses PostgreSQL.

For local testing, either run PostgreSQL locally with:

```text
Database: food_hungry
Username: postgres
Password: postgres
```

Or start `user-service` with Supabase values:

```powershell
set SPRING_DATASOURCE_URL=jdbc:postgresql://YOUR_SUPABASE_HOST:5432/postgres?sslmode=require
set SPRING_DATASOURCE_USERNAME=postgres
set SPRING_DATASOURCE_PASSWORD=YOUR_SUPABASE_DATABASE_PASSWORD
mvn spring-boot:run -pl user-service
```

## Step 2: Frontend

Open one terminal from:

```text
C:\Users\raman\Documents\Codex\2026-06-15\hi-i-want-to-create-one\work\food-hungry\app
```

Run:

```powershell
npm install
npm run web
```

For Android:

```powershell
npm start
```

Install Expo Go from Play Store, then scan the QR code shown by Expo.

## Important Mobile Note

On a real Android phone, `localhost` means the phone itself, not your laptop. Later we will set:

```text
EXPO_PUBLIC_API_URL=http://YOUR-LAPTOP-IP:8080
```

Example:

```text
EXPO_PUBLIC_API_URL=http://192.168.1.10:8080
```
