import pyodbc

def get_connection():

    conn = pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=MSI\\SQLEXPRESS;"
        "DATABASE=OWASP_LAB;"
        "Trusted_Connection=yes;"
    )

    return conn