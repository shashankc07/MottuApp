# Deploy Mottu as a monolith (free hosting)

The app runs as a **single service**: Spring Boot serves the API and the Next.js frontend (static files). Your girlfriend can open one URL in her phone’s browser.

## Option 1: Render.com (recommended, free tier)

1. **Push the repo to GitHub** (if not already).

2. **Sign up at [render.com](https://render.com)** (free).

3. **New Web Service**
   - Dashboard → **New +** → **Web Service**
   - Connect your GitHub repo and select the Mottu app repo.

4. **Settings**
   - **Name:** `mottu-app` (or any name).
   - **Region:** choose one close to you.
   - **Runtime:** **Docker**.
   - **Dockerfile path:** `./Dockerfile` (repo root).
   - **Instance type:** **Free**.

5. **Environment**
   - Add variable: **JWT_SECRET** → **Generate** (or type a long random string).
   - Render sets **PORT** automatically; the app uses it.

6. **Deploy**
   - Click **Create Web Service**. Render builds the Docker image (Node + Java) and runs the JAR.
   - When it’s live, you get a URL like `https://mottu-app-xxxx.onrender.com`.

7. **Share the URL**
   - Send her that URL. She opens it on her phone, registers, and uses the app. No install.

**Free tier notes**
- Service sleeps after ~15 minutes of no traffic; first open may take 30–60 seconds to wake.
- Data is stored in an in-memory H2 DB: **it’s reset when the app restarts or redeploys**. For persistent data later you can add a free Postgres DB on Render and switch the app to it.

---

## Option 2: Build and run the JAR locally / on any server

If you have a machine or server that’s always on:

```bash
# From the project root (where pom.xml and mottu-ui/ are)
chmod +x build-monolith.sh
./build-monolith.sh
```

Then run:

```bash
java -jar target/mottu-app-0.0.1-SNAPSHOT.jar
```

Open `http://localhost:8080` (or your server’s IP). To use a fixed port and JWT secret:

```bash
PORT=8080 JWT_SECRET=your-long-secret java -jar target/mottu-app-0.0.1-SNAPSHOT.jar
```

---

## Option 3: Other free hosts

- **Railway** – Connect repo, use the same `Dockerfile`, add `JWT_SECRET`, deploy.
- **Fly.io** – `fly launch` and point to the repo; use the Dockerfile and set `JWT_SECRET` and port.

Same idea everywhere: one URL, one monolith, works in any phone browser.
