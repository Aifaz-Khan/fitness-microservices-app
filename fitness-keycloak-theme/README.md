# Fitness AI Custom Keycloak Login Theme

This folder contains a custom Keycloak theme named `fitness-keycloak-theme` that inherits the layouts from Keycloak's default theme and applies a premium, dark-mode styling layer to match your React frontend.

It themes the following forms:
1. **Login Page** (and Login with Email)
2. **Registration Page** (User signups)
3. **Forgot Password Page** (Reset password requests)
4. **MFA Setup & TOTP Screens**
5. **System Feedback & Alert banners** (Errors, Warnings, Success alerts)

---

## How to Install the Theme

### Option A: Local Keycloak Installation
If you run Keycloak directly on your machine:
1. Copy this entire folder (`fitness-keycloak-theme`) into your Keycloak server's `themes/` directory:
   ```bash
   cp -r /Users/macbookair/Desktop/CODING/fitness_microservice/fitness-keycloak-theme <keycloak-install-path>/themes/
   ```
2. Restart the Keycloak server.

### Option B: Docker Keycloak Container
If you run Keycloak inside a Docker container, map this folder as a volume inside your `docker-compose.yml` or Docker run command:

#### Docker Run
```bash
docker run -d -p 8181:8080 \
  -v /Users/macbookair/Desktop/CODING/fitness_microservice/fitness-keycloak-theme:/opt/keycloak/themes/fitness-keycloak-theme \
  -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev
```

#### Docker Compose
Add a volume mapping under your Keycloak service description:
```yaml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    ports:
      - "8181:8080"
    volumes:
      - /Users/macbookair/Desktop/CODING/fitness_microservice/fitness-keycloak-theme:/opt/keycloak/themes/fitness-keycloak-theme
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
    command: start-dev
```

---

## How to Activate the Theme in Keycloak

1. Navigate to the **Keycloak Admin Console** at `http://localhost:8181` and log in with your admin credentials.
2. Select your realm (**`fitness-oauth2`**) from the top-left dropdown.
3. Select **Realm Settings** from the sidebar.
4. Click on the **Themes** tab.
5. In the **Login Theme** dropdown, select `fitness-keycloak-theme` (it will appear in the list once Keycloak detects the directory).
6. Click **Save**.

### Enable Registration & Forgot Password Link
To make sure registrations and password reset links appear:
1. In **Realm Settings**, navigate to the **Login** tab.
2. Turn **User registration** to `ON`.
3. Turn **Forgot password** to `ON`.
4. Turn **Login with email** to `ON` (optional, for email login).
5. Click **Save**.

Open a new Private Browser window and head to your React app to see your custom-branded, premium dark-theme Keycloak login screens!
