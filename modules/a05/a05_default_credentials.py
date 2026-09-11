from flask import Blueprint, request

a05_04_bp = Blueprint("a05_04", __name__)

@a05_04_bp.route("/a05/04/login", methods=["GET"])
def login():
    username = request.args.get("username")
    password = request.args.get("password")

    # default credentials (lỗi)
    if username == "admin" and password == "admin":
        return """
        <h1>Admin Dashboard</h1>
        <p>Login success</p>
        <b>FLAG{DEFAULT_CREDENTIALS}</b>
        """

    return """
    <h2>Login Page</h2>
    <p>Hint: try default credentials</p>
    <p>admin/admin</p>
    """