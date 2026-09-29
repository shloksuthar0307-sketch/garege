# Security Assessment & Recommendations

Based on my analysis of your Django & React project, I've identified several areas that need security improvements, especially before deploying to a production environment. 

## 🔴 High Priority (Fix Immediately Before Production)

### 1. Hardcoded Django Secret Key
**Issue:** In `backend/core_config/settings.py`, your `SECRET_KEY` is hardcoded. If this key is exposed (e.g., via a public repository), attackers can forge session cookies, reset passwords, and compromise your application.
**Fix:** Move the secret key to an environment variable.
```python
# settings.py
import os
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'your-default-dev-key')
```

### 2. Debug Mode is Enabled
**Issue:** `DEBUG = True` in `settings.py`. In production, this will display detailed error pages with sensitive information like your code structure, variables, and database queries.
**Fix:** Ensure it defaults to `False` unless specified otherwise in the environment.
```python
# settings.py
DEBUG = os.environ.get('DJANGO_DEBUG', 'False') == 'True'
```

### 3. Wildcard Allowed Hosts
**Issue:** `ALLOWED_HOSTS = ['*']` allows HTTP Host header attacks.
**Fix:** Specify the exact domain names or IP addresses that your application is hosted on.
```python
# settings.py
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
```

### 4. Overly Permissive CORS Policy
**Issue:** `CORS_ALLOW_ALL_ORIGINS = True` allows any website on the internet to make requests to your API.
**Fix:** Restrict it to only your frontend's domain.
```python
# settings.py
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
    "http://localhost:5173", # Dev environment
]
```

## 🟡 Medium Priority (Best Practices)

### 1. Insecure JWT Token Storage
**Issue:** In the frontend (`frontend/src/lib/api.ts`), the JWT access token is stored in `localStorage` (`localStorage.getItem('accessToken')`). This makes it vulnerable to Cross-Site Scripting (XSS) attacks. If an attacker injects a malicious script, they can steal the tokens.
**Fix:** The most secure way to handle JWTs in a Single Page Application is to have the backend set them as `HttpOnly`, `Secure`, and `SameSite=Lax` (or `Strict`) cookies. This prevents JavaScript from accessing them. 
Alternatively, keep tokens in memory (e.g., in a Zustand store) and handle silent refreshes if you continue using `localStorage`.

### 2. Hardcoded API URLs
**Issue:** `API_BASE_URL` is hardcoded to `http://localhost:8000/api/v1` in your frontend code (`frontend/src/api/client.ts` and `frontend/src/lib/api.ts`).
**Fix:** Use Vite environment variables so you can easily switch between development and production backends.
```typescript
// frontend/src/lib/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
```
*(Don't forget to create a `.env` file in your frontend folder with `VITE_API_BASE_URL=...`)*

### 3. Database Credentials
**Issue:** While you are using `os.environ.get` for the Postgres database, there are hardcoded default fallbacks (e.g., `os.environ.get('DB_PASS', 'repairtrace_password')`).
**Fix:** For production, it's safer to avoid having default passwords in the codebase. If the environment variable isn't set, the app should throw an error or fail to start so you know configuration is missing, rather than silently using a weak default password.

## 🟢 Low Priority / General Recommendations

* **HTTPS Configuration:** In production, ensure you use HTTPS. Once you do, add the following to your `settings.py` to enforce secure cookies:
  ```python
  SESSION_COOKIE_SECURE = True
  CSRF_COOKIE_SECURE = True
  SECURE_SSL_REDIRECT = True
  ```
* **Dependency Scanning:** Periodically check your `requirements.txt` and `package.json` for known vulnerabilities using tools like `pip-audit` for Python and `npm audit` for Node.js.
* **Rate Limiting:** Your Django REST Framework doesn't seem to have global rate limiting configured. Consider adding `rest_framework.throttling.AnonRateThrottle` and `UserRateThrottle` to prevent brute-force attacks and abuse.
