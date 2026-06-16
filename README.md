# Food Hungry

Food Hungry is a food delivery app planned for Android, iOS, and Web with one Expo React Native frontend and Spring Boot microservices backend.

## Project Structure

- `app`: Expo React Native app for Android, iOS, and Web.
- `backend/api-gateway`: Spring Boot API gateway on port `8080`.
- `backend/restaurant-service`: Spring Boot restaurant and menu service on port `8081`.
- `backend/order-service`: Spring Boot order service on port `8082`.
- `backend/user-service`: Spring Boot login and registration service on port `8084`.
- `docs`: deployment and app store planning notes.

## Local Run Order

Start backend first, then frontend.

Terminal 1:

```bash
cd backend
mvn spring-boot:run -pl restaurant-service
```

Terminal 2:

```bash
cd backend
mvn spring-boot:run -pl order-service
```

Terminal 3:

```bash
cd backend
mvn spring-boot:run -pl user-service
```

Terminal 4:

```bash
cd backend
mvn spring-boot:run -pl api-gateway
```

Terminal 5:

```bash
cd app
npm install
npm run web
```

For Android phone testing:

```bash
cd app
npm start
```

Then install the Expo Go app on your Android phone and scan the QR code.

## Local URLs

- Food Hungry web: use the web URL printed by Expo after `npm run web`.
- API gateway: `http://localhost:8080`
- Restaurants API: `http://localhost:8080/api/restaurants`
- Restaurant service direct: `http://localhost:8081/restaurants`
- Order service direct: `http://localhost:8082/orders`
- User service direct: `http://localhost:8084/users`
- Login API through gateway: `http://localhost:8080/api/users/login`
- Register API through gateway: `http://localhost:8080/api/users/register`

## User Service Database

`user-service` uses PostgreSQL.

Set these environment variables for Supabase or cloud deployment:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://YOUR_SUPABASE_HOST:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=YOUR_SUPABASE_DATABASE_PASSWORD
```

## First Version Scope

- Customer app for Android, iOS, and Web.
- Restaurant list and menu.
- Cart and order total.
- Spring Boot APIs for restaurants and orders.
- Later: login, database, restaurant admin, delivery partner, payments, notifications.
