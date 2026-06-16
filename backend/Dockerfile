FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
ARG SERVICE_NAME
COPY pom.xml .
COPY restaurant-service restaurant-service
COPY order-service order-service
COPY user-service user-service
COPY api-gateway api-gateway
RUN mvn -pl ${SERVICE_NAME} -am package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
ARG SERVICE_NAME
COPY --from=build /app/${SERVICE_NAME}/target/${SERVICE_NAME}-0.1.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
