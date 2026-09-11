import random

from flask import request

from db import get_connection

# store OTPs
PENDING_MFA = {}

# count attempts
MFA_ATTEMPTS = {}

def weak_mfa_login():

    username = request.args.get("username", "")
    password = request.args.get("password", "")

    conn = get_connection()
    cursor = conn.cursor()

    query = f"""
    SELECT * FROM users
    WHERE username = '{username}'
    AND password = '{password}'
    """

    print(query)

    try:

        cursor.execute(query)

        user = cursor.fetchone()

        if user:

            # weak OTP:
            # only 4 digits
            otp = str(random.randint(1000, 9999))

            PENDING_MFA[user.username] = otp

            MFA_ATTEMPTS[user.username] = 0

            print(f"[DEBUG OTP] {user.username} => {otp}")

            result = f"""
            <h1>Password Correct</h1>

            <p>
            Multi-Factor Authentication Required
            </p>

            <hr>

            <form action="/a07/weak_mfa_verify">

                <input type="hidden"
                name="username"
                value="{user.username}">

                <input type="text"
                name="otp"
                placeholder="Enter OTP">

                <button>Verify OTP</button>

            </form>

            <hr>

            <p>
            OTP is only 4 digits.
            </p>

            <p>
            No rate limiting detected.
            </p>
            """

        else:

            result = """
            <h1>Login Failed</h1>
            """

    except Exception as e:

        result = f"""
        <h2>SQL Error:</h2>

        <pre>{e}</pre>
        """

    conn.close()

    return result


def weak_mfa_verify():

    username = request.args.get("username", "")
    otp = request.args.get("otp", "")

    if username not in MFA_ATTEMPTS:
        MFA_ATTEMPTS[username] = 0

    MFA_ATTEMPTS[username] += 1

    real_otp = PENDING_MFA.get(username)

    if otp == real_otp:

        return f"""
        <h1>MFA Success</h1>

        <p>Welcome {username}</p>

        <p>
        OTP Attempts:
        {MFA_ATTEMPTS[username]}
        </p>

        <hr>

        <h3>
        FLAG{{WEAK_MFA_BYPASS}}
        </h3>
        """

    return f"""
    <h1>Invalid OTP</h1>

    <p>
    OTP Attempts:
    {MFA_ATTEMPTS[username]}
    </p>

    <p>
    Unlimited OTP retries allowed.
    </p>
    """