# Deploy Mottu as a monolith (free hosting)

The app runs as a **single service**: Spring Boot serves the API and the Next.js frontend (static files). Your girlfriend can open one URL in her phone’s browser.

## Option 1: Render.com (recommended, free tier) with free Postgres

1. **Push the repo to GitHub** (if not already).

2. **Sign up at [render.com](https://render.com)** (free).

3. **Create a free PostgreSQL database**
   - Dashboard → **New +** → **PostgreSQL**.
   - **Name:** `mottu-db` (or any name).
   - **Region:** same as you’ll use for the app.
   - **Instance type:** **Free**.
   - Create the database. Open it and go to **Connect** → copy the **Internal Database URL** (use this so the app and DB talk inside Render).

4. **New Web Service**
   - Dashboard → **New +** → **Web Service**.
   - Connect your GitHub repo and select the Mottu app repo.

5. **Settings**
   - **Name:** `mottu-app` (or any name).
   - **Region:** same as the database.
   - **Runtime:** **Docker**.
   - **Dockerfile path:** `./Dockerfile` (repo root).
   - **Instance type:** **Free**.

6. **Environment**
   - **JWT_SECRET** → **Generate** (or a long random string).
   - **DATABASE_URL** → paste the **Internal Database URL** from step 3 (starts with `postgresql://`).  
     Or: in the database’s **Connect** tab, use “Add to Web Service” and pick `mottu-app` so Render sets `DATABASE_URL` for you.
   - Render sets **PORT** automatically; the app uses it.

7. **Deploy**
   - Click **Create Web Service**. Render builds the Docker image and runs the JAR.
   - When it’s live, you get a URL like `https://mottu-app-xxxx.onrender.com`.

8. **Share the URL**
   - Send her that URL. She opens it on her phone, registers, and uses the app. No install.

**Persistence:** With `DATABASE_URL` set to the Render Postgres URL, users and memories are stored in PostgreSQL and **persist across restarts and redeploys**.

**If you don’t set DATABASE_URL:** The app uses an in-memory H2 database. Data is lost when the app restarts or redeploys (fine for quick local/testing use).

**Free tier notes**
- Service sleeps after ~15 minutes of no traffic; first open may take 30–60 seconds to wake.
- Free Postgres has a 1 GB limit and is suitable for this app.

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

To use **PostgreSQL** instead of H2, set the datasource (example for local Postgres):

```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/mottu
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=yourpassword
java -jar target/mottu-app-0.0.1-SNAPSHOT.jar
```

Or a single URL (e.g. from a cloud provider):

```bash
export DATABASE_URL=postgresql://user:pass@host:5432/dbname
java -jar target/mottu-app-0.0.1-SNAPSHOT.jar
```

---

## Option 3: Other free hosts

- **Railway** – Connect repo, use the same `Dockerfile`, add `JWT_SECRET`, deploy.
- **Fly.io** – `fly launch` and point to the repo; use the Dockerfile and set `JWT_SECRET` and port.

Same idea everywhere: one URL, one monolith, works in any phone browser.
