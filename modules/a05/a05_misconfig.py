"""
A05:2021 — Security Misconfiguration
=====================================
Blueprint này phục vụ hai mục đích:

1. Một "target site" lỗi thật (route /a05/...) để ai dùng curl/browser thật
   cũng thấy đúng hành vi misconfiguration (không header bảo mật, directory
   listing, .env lộ, debug console mở).

2. Một API terminal giả lập (/a05/api/terminal) dùng cho trang A05Page.jsx —
   nhận lệnh dạng text (ls, cat, curl ...) và trả về output y hệt những gì
   một terminal thật sẽ in ra khi tấn công các lỗi trên, để người dùng luyện
   tập mà không cần mở tab khác.

3. Một API chấm điểm (/a05/api/verify) để xác thực 5 câu trả lời phía server,
   tránh việc đáp án bị lộ hoàn toàn ở phía client.
"""

from flask import Blueprint, jsonify, request, Response

a05_misconfig_bp = Blueprint('a05_misconfig', __name__, url_prefix='/a05')

# ──────────────────────────────────────────────────────────────────
# Dữ liệu mô phỏng "hệ thống lỗi" — dùng chung cho cả route thật và
# cho terminal giả lập, để hai bên luôn đồng bộ.
# ──────────────────────────────────────────────────────────────────

UPLOADS_FILES = [
    {"name": "report_q1.pdf",        "size": "212K", "type": "file"},
    {"name": "logo_final.png",       "size": "48K",  "type": "file"},
    {"name": "passwords_old.txt",    "size": "1.1K", "type": "file"},
    {"name": "backup_2023.zip",      "size": "3.4M", "type": "file"},
    {"name": ".env",                 "size": "412B", "type": "file"},
]

PASSWORDS_OLD_TXT = (
    "admin:Adm1n#2021\n"
    "root:toor12345\n"
    "svc_backup:Backup!Svc99\n"
)

ENV_FILE = (
    "FLASK_ENV=production\n"
    "FLASK_DEBUG=1\n"
    "DB_HOST=10.0.4.12\n"
    "DB_USER=app_admin\n"
    "DB_PASSWORD=Sup3rSecretDB!2024\n"
    "SECRET_KEY=9f8a7b6c5d4e3f2a1b0c\n"
)

# Header KHÔNG có mặt cố ý — đây chính là lỗi cần phát hiện ở Q4
SECURE_HEADERS_PRESENT = {
    "Content-Type": "text/html; charset=utf-8",
    "Server": "Werkzeug/3.0.1 Python/3.11.4",
}
# (Cố ý KHÔNG thêm: X-Frame-Options, Content-Security-Policy, X-Content-Type-Options)


# ──────────────────────────────────────────────────────────────────
# 1. ROUTE THẬT — ai curl/browser thật vào cũng thấy đúng lỗi
# ──────────────────────────────────────────────────────────────────

@a05_misconfig_bp.route('/')
def a05_index():
    return Response(
        "<h3>A05 Lab Server</h3><p>Try /a05/headers, /a05/uploads/, /a05/console</p>",
        mimetype='text/html'
    )


@a05_misconfig_bp.route('/headers')
def a05_headers():
    """Endpoint cố ý KHÔNG đặt header bảo mật nào — lỗi Q4."""
    resp = Response("OK", mimetype='text/plain')
    for k, v in SECURE_HEADERS_PRESENT.items():
        resp.headers[k] = v
    return resp


@a05_misconfig_bp.route('/uploads/')
def a05_uploads_listing():
    """Mô phỏng directory listing bật — lỗi Q2."""
    rows = "".join(
        f"<li><a href='/a05/uploads/{f['name']}'>{f['name']}</a> — {f['size']}</li>"
        for f in UPLOADS_FILES
    )
    html = f"<h3>Index of /a05/uploads/</h3><ul>{rows}</ul>"
    return Response(html, mimetype='text/html')


@a05_misconfig_bp.route('/uploads/passwords_old.txt')
def a05_uploads_passwords():
    return Response(PASSWORDS_OLD_TXT, mimetype='text/plain')


@a05_misconfig_bp.route('/uploads/.env')
def a05_uploads_env():
    """File .env lộ trên web root — lỗi Q3."""
    return Response(ENV_FILE, mimetype='text/plain')


@a05_misconfig_bp.route('/console')
def a05_console():
    """Mô phỏng Werkzeug interactive debugger bị lộ — lỗi Q5 (lý thuyết)."""
    html = (
        "<h1>RuntimeError</h1>"
        "<p>Werkzeug Debugger is active!</p>"
        "<p>An interactive Python console is available. "
        "Anyone reaching this page can execute arbitrary code on the server.</p>"
    )
    return Response(html, mimetype='text/html')


# ──────────────────────────────────────────────────────────────────
# 2. TERMINAL GIẢ LẬP — dùng cho A05Page.jsx
# ──────────────────────────────────────────────────────────────────

HELP_TEXT = (
    "Available commands:\n\n"
    "  ls <path>              list files in a directory\n"
    "  cat <path>             print file contents\n"
    "  curl [-I] <url>        fetch a URL (-I for headers only)\n"
    "  pwd                    print working directory\n"
    "  whoami                 print current user\n"
    "  clear                  clear the terminal\n"
    "  help                   show this message\n"
)


def _fmt_listing():
    lines = [f"{f['size']:>8}  {f['name']}" for f in UPLOADS_FILES]
    return "\n".join(lines)


def _handle_ls(args):
    target = args[0] if args else ""
    target = target.rstrip('/')
    if target in ("/a05/uploads", "a05/uploads", "uploads", ""):
        return _fmt_listing()
    return f"ls: cannot access '{args[0] if args else ''}': No such file or directory"


def _handle_cat(args):
    if not args:
        return "cat: missing file operand"
    path = args[0]
    norm = path.lstrip('/').replace("a05/", "", 1) if "a05/" in path else path.lstrip('/')
    norm = norm.replace("uploads/", "", 1) if norm.startswith("uploads/") else norm

    if norm in (".env", "uploads/.env"):
        return ENV_FILE.strip()
    if norm in ("passwords_old.txt",):
        return PASSWORDS_OLD_TXT.strip()
    if norm in [f["name"] for f in UPLOADS_FILES]:
        return f"cat: {path}: Permission denied (binary or unreadable file)"
    return f"cat: {path}: No such file or directory"


def _handle_curl(args):
    head_only = "-I" in args
    urls = [a for a in args if not a.startswith("-")]
    if not urls:
        return "curl: try 'curl --help' for more information"
    url = urls[0]

    if url.rstrip('/').endswith('/a05/headers'):
        if head_only:
            lines = ["HTTP/1.1 200 OK"]
            lines += [f"{k}: {v}" for k, v in SECURE_HEADERS_PRESENT.items()]
            return "\n".join(lines)
        return "OK"

    if url.rstrip('/').endswith('/a05/uploads') or url.rstrip('/').endswith('/a05/uploads/'):
        return _fmt_listing()

    if url.endswith('/a05/uploads/.env'):
        return ENV_FILE.strip()

    if url.endswith('/a05/uploads/passwords_old.txt'):
        return PASSWORDS_OLD_TXT.strip()

    if url.rstrip('/').endswith('/a05/console'):
        return (
            "RuntimeError\n"
            "Werkzeug Debugger is active!\n"
            "An interactive Python console is available at this endpoint.\n"
            "Anyone reaching this page can execute arbitrary code on the server."
        )

    return f"curl: (6) Could not resolve host or path: {url}"


@a05_misconfig_bp.route('/api/terminal', methods=['POST'])
def a05_terminal():
    """Nhận 1 lệnh dạng text, trả lại output mô phỏng."""
    data = request.get_json(silent=True) or {}
    raw = (data.get('command') or "").strip()

    if not raw:
        return jsonify({"output": ""})

    parts = raw.split()
    cmd, args = parts[0].lower(), parts[1:]

    if cmd == 'help':
        out = HELP_TEXT
    elif cmd == 'pwd':
        out = "/var/www/a05"
    elif cmd == 'whoami':
        out = "www-data"
    elif cmd == 'clear':
        out = "__CLEAR__"
    elif cmd == 'ls':
        out = _handle_ls(args)
    elif cmd == 'cat':
        out = _handle_cat(args)
    elif cmd == 'curl':
        out = _handle_curl(args)
    else:
        out = f"bash: {cmd}: command not found"

    return jsonify({"output": out})


# ──────────────────────────────────────────────────────────────────
# 3. CHẤM ĐIỂM PHÍA SERVER — 5 câu hỏi
# ──────────────────────────────────────────────────────────────────

ANSWER_KEY = {
    "q1": {"defaults", "default"},
    "q2": {"passwords_old.txt"},
    "q3": {"sup3rsecretdb!2024"},
    "q4": {"x-frame-options", "content-security-policy", "csp"},
    "q5": {"remove_debug"},
}


@a05_misconfig_bp.route('/api/verify', methods=['POST'])
def a05_verify():
    data = request.get_json(silent=True) or {}
    qid = (data.get('question') or "").strip().lower()
    answer = (data.get('answer') or "").strip().lower()

    if qid not in ANSWER_KEY:
        return jsonify({"correct": False, "message": "Unknown question id."}), 400

    correct = False
    if qid == "q4":
        correct = any(k in answer for k in ANSWER_KEY["q4"])
    else:
        correct = answer in ANSWER_KEY[qid]

    return jsonify({"correct": correct})