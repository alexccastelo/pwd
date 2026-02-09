# Deploying to Coolify

This guide explains how to deploy the "pwd" application to your VPS using Coolify.

## Prerequisites
- A VPS running Ubuntu 24.04 LTS (already set up).
- Coolify installed on the VPS.
- This codebase pushed to a Git repository (GitHub/GitLab) or available to Coolify.

## Deployment Steps

1. **Access Coolify Dashboard**:
   - Open your Coolify instance in your browser.

2. **Create a New Resource**:
   - Go to your Project/Environment.
   - Click **+ New**.
   - Select **Git Repository** (private or public).
   - Connect your repository and select the branch.

3. **Configuration**:
   - **Build Pack**: Select **Docker Compose**.
   - **Docker Compose File**: Coolify should automatically detect `docker-compose.yaml`.
   - **Domains**:
     - Set the domain for the frontend service.
     - You shouldn't need a domain for the backend if you are using internal Docker networking, but if you want external access to the API, set a domain for the `backend` service as well.

4. **Environment Variables**:
   You need to define the following environment variables in Coolify for the **backend** service (or shared envs):

   ```env
   DATABASE_URL="mysql://root:rootpassword@db:3306/pwd_manager"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=3001
   ```

   *Note*: The `DATABASE_URL` above assumes you are using the `db` service defined in `docker-compose.yml`. If you use an external database or a managed Coolify database, update the URL accordingly.

5. **Deploy**:
   - Click **Deploy**.
   - Coolify will build the Docker images for frontend and backend and start the services.

## Architecture
- **Frontend**: Served by Nginx on port 80 (internally). Coolify routes traffic to it.
- **Backend**: Node.js/Express server on port 3001.
- **Database**: MySQL 8.0 (service name `db`).
- **Networking**:
  - The frontend Nginx is configured to proxy requests to `http://backend:3001/auth`, `/passwords`, and `/health`.
  - All valid internal API calls from the browser will hit the Frontend domain, be proxied to the Backend container, and return the response.

## Troubleshooting
- **Frontend 404s**: Ensure `client/nginx.conf` is correctly copied and used. It handles SPA routing.
- **API Connection Failed**: Check the Network tab. API requests should go to `https://your-frontend-domain.com/auth/...`. If they go to localhost, the build might be using old code (clear cache/rebuild).
- **Database Connection Error**: Check the `backend` logs. Ensure `DATABASE_URL` is correct and the `db` service is healthy.
