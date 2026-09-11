from flask import Flask
from flask_cors import CORS
from modules.a01.a01_idor import a01_idor_bp
from modules.a02.a02_weak_hash import a02_weak_hash_bp
from modules.a03.a03_injection import a03_injection_bp
from modules.a05.a05_misconfig import a05_misconfig_bp
from modules.a06.a06_vulnerable_components import a06_vulnerable_components_bp
from modules.a07.a07_auth_failures import a07_auth_bp
from modules.a08.a08_jwt import a08_jwt_bp
from modules.a10.a10_ssrf import a10_ssrf_bp

app = Flask(__name__)

# ── REQUIRED for Flask session (cookies) to work ─────────────────────────────
app.secret_key = 'owasp-lab-secret-key-change-in-production'

app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

# ── CORS: allow Vite dev server with credentials (needed for session cookies) ─
CORS(app,
     origins=[
         'http://localhost:5173',
         'http://127.0.0.1:5173',
         'http://localhost:3000',
         'https://*.vercel.app'  # Cho phép tất cả các tên miền từ Vercel
     ],
     supports_credentials=True)

# ── A01: Broken Access Control ───────────────────────────────────────────────
app.register_blueprint(a01_idor_bp)

# ── A02: Cryptographic Failures ──────────────────────────────────────────────
app.register_blueprint(a02_weak_hash_bp)

# ── A03: Injection ───────────────────────────────────────────────────────────
app.register_blueprint(a03_injection_bp)

# ── A05: Security Misconfiguration ───────────────────────────────────────────
app.register_blueprint(a05_misconfig_bp)

# ── A06: Vulnerable & Outdated Components ────────────────────────────────────
app.register_blueprint(a06_vulnerable_components_bp)

# ── A07: Identification & Authentication Failures ────────────────────────────
app.register_blueprint(a07_auth_bp)

# ── A08: Software & Data Integrity Failures ──────────────────────────────────
app.register_blueprint(a08_jwt_bp)

# ── A10: Server-Side Request Forgery (SSRF) ──────────────────────────────────
app.register_blueprint(a10_ssrf_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)