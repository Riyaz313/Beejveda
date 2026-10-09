# Development README — server

This file contains steps for running the backend locally, seeding the dev database, and securely handling secrets.

1) Local dev quick-start

 - Copy the example env and fill values (DO NOT commit `.env`):

 ```powershell
 cd server
 copy .env.example .env
 # edit .env and fill real values for local development
 npm install
 npm run dev
 ```

2) Seed the in-memory DB (development only)

 - When running in `NODE_ENV=development`, the server exposes a development seeding endpoint:

 ```powershell
 # POST to seed sample category + products
 Invoke-RestMethod -Uri http://localhost:5000/api/dev/seed -Method Post -UseBasicParsing
 ```

3) Important: secrets and rotation

 - `server/.env` must never be committed. The repository contains `server/.env.example` with placeholder values.
 - If real secrets were ever committed to the repo, rotate them immediately:
   - MongoDB Atlas: rotate user password and connection string; update `MONGODB_URI`.
   - JWT secrets: generate new `JWT_SECRET` and `JWT_REFRESH_SECRET` and invalidate old tokens if possible.
   - Backblaze B2: rotate `B2_APPLICATION_KEY` and any compromised keys.

4) Removing a committed `.env` from history (if you previously pushed it)

 - If secrets were pushed to a remote, coordinate rotating credentials and then remove them from history using tools like `git filter-repo` or `bfg` and force-push. Example (careful):

 ```bash
 # Warning: rewriting history; coordinate with your team
 pip install git-filter-repo
 git filter-repo --path server/.env --invert-paths
 git push --force
 ```

5) Notes

 - The backend must connect only to the configured MongoDB Atlas URI. If Atlas is unavailable, the process exits and the API server does not start.
 - After rotating secrets, update CI/CD and any deployed environments with the new values.
