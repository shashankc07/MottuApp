#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "Building Next.js static export..."
cd mottu-ui
npm ci --omit=optional
npm run build
cd ..

echo "Copying frontend into Spring Boot static resources..."
STATIC_DIR="src/main/resources/static"
rm -rf "${STATIC_DIR:?}"/*
cp -r mottu-ui/out/* "$STATIC_DIR/"

echo "Building Spring Boot JAR..."
./mvnw -q -DskipTests package

echo "Done. Run with: java -jar target/mottu-app-0.0.1-SNAPSHOT.jar"
echo "Or on Render: the JAR is built; set start command to: java -jar target/mottu-app-0.0.1-SNAPSHOT.jar"
