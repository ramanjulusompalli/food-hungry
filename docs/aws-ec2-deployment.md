# AWS EC2 Deployment

## Architecture

One EC2 instance runs four independent Docker containers:

```text
Internet -> API Gateway :8080 -> restaurant-service :8080
                              -> order-service :8080
                              -> user-service :8080
```

Only API Gateway is published to the EC2 host.

## Deploy Commands

After connecting to EC2 and installing Git and Docker:

```bash
git clone https://github.com/ramanjulusompalli/food-hungry.git
cd food-hungry
docker compose up -d --build
docker compose ps
docker compose logs -f api-gateway
```

Test:

```text
http://EC2_PUBLIC_IP:8080/actuator/health
http://EC2_PUBLIC_IP:8080/api/restaurants
http://EC2_PUBLIC_IP:8080/api/orders
http://EC2_PUBLIC_IP:8080/api/users
```

## Current Limitation

Users and orders are stored in memory. They reset when their containers restart. PostgreSQL must be added before relying on persistent customer data.
