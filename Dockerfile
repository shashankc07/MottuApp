# Stage 1: Build Next.js static export
FROM node:20-alpine AS frontend
WORKDIR /app/mottu-ui
COPY mottu-ui/package.json mottu-ui/package-lock.json* ./
RUN npm ci --omit=optional
COPY mottu-ui/ .
RUN npm run build

# Stage 2: Build Spring Boot with embedded frontend
FROM maven:3.9-eclipse-temurin-17-alpine AS backend
WORKDIR /app

# Copy Maven config and source
COPY pom.xml .
COPY src src

# Copy frontend export into static resources
RUN rm -rf src/main/resources/static && mkdir -p src/main/resources/static
COPY --from=frontend /app/mottu-ui/out src/main/resources/static

# Build JAR (skip tests for faster deploy)
RUN mvn -q -DskipTests package

# Stage 3: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend /app/target/mottu-app-*.jar app.jar

# Render and most clouds set PORT
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]
