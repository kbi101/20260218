# Stage 1: Build Modern React Frontend
FROM node:20-bookworm-slim AS frontend-build
WORKDIR /app/frontend
COPY pao-frontend-react/package*.json ./
RUN npm install
COPY pao-frontend-react/ ./
RUN npm run build

# Stage 2: Build Spring Boot Backend
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend
COPY pao-backend/pom.xml ./
RUN mvn dependency:go-offline

COPY pao-backend/src ./src
# Copy static assets from React build to Spring Boot static resources
COPY --from=frontend-build /app/frontend/dist/ ./src/main/resources/static/

# Package JAR with integrated frontend
RUN mvn clean package -DskipTests

# Stage 3: Final Runtime Image
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=backend-build /app/backend/target/pao-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
