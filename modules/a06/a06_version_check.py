import subprocess
from flask import Flask, request, render_template_string

app = Flask(__name__)


def component_check():
    output = ""

    ALLOWED_COMMANDS = ["py -m pip show PyYAML", "py -m pip list"]

    if request.method == "POST":
        cmd = request.form.get("cmd", "").strip()

        if cmd in ALLOWED_COMMANDS:
            try:
                process = subprocess.run(
                    cmd, shell=True, capture_output=True, text=True, check=True
                )

                output = process.stdout

            except subprocess.CalledProcessError as e:
                output = f"Hệ thống lỗi khi thực thi: {e.stderr}"
            except Exception as e:
                output = f"Lỗi không xác định: {str(e)}"
        else:
            output = """
Command not allowed.

Allowed commands:
py -m pip show PyYAML
py -m pip list
"""

    return f"""
    <h1>A06 - Component Check (Real Terminal)</h1>

    <form method="POST">
        <input name="cmd" style="width:600px" placeholder="Nhập lệnh xem phiên bản...">
        <button>Run</button>
    </form>

    <pre>{output}</pre>
    """
