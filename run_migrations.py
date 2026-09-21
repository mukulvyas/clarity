import os
import psycopg2
from dotenv import load_dotenv

def main():
    load_dotenv("server/.env")
    
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL missing in server/.env")
        return

    # Clean pgbouncer parameter if direct DDL execution needed
    # Port 5432 is direct PostgreSQL session connection on Supabase
    conn_str = db_url.replace(":6543/postgres?pgbouncer=true", ":5432/postgres")
    conn_str = conn_str.replace("aws-0-ap-south-1.pooler.supabase.com:6543", "db.xlyypggmssdxpdtitgxa.supabase.co:5432")

    print(f"Connecting to database...")
    try:
        conn = psycopg2.connect(conn_str)
    except Exception as e:
        print(f"Direct connection failed: {e}. Trying raw DATABASE_URL...")
        conn_str = db_url.replace("?pgbouncer=true", "")
        conn = psycopg2.connect(conn_str)

    conn.autocommit = True
    cursor = conn.cursor()

    migration_files = [
        "server/migrations/001_initial_schema.sql",
        "server/migrations/002_add_clause_details.sql"
    ]

    for filepath in migration_files:
        if not os.path.exists(filepath):
            print(f"File not found: {filepath}")
            continue
            
        print(f"Executing migration: {filepath}")
        with open(filepath, "r", encoding="utf-8") as f:
            sql = f.read()

        try:
            cursor.execute(sql)
            print(f"SUCCESS: {filepath} executed cleanly!")
        except Exception as e:
            print(f"ERROR executing {filepath}: {e}")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
