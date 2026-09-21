import os
from supabase import create_client, Client
from dotenv import load_dotenv

def main():
    load_dotenv("server/.env")
    
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print("Missing Supabase credentials in server/.env")
        return
        
    supabase: Client = create_client(url, key)
    
    email = "demo@clarity.app"
    password = "password123"
    
    try:
        # Create user via admin API which bypasses rate limits and auto-confirms
        user = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True
        })
        print(f"\nSUCCESS! Test account created directly via Admin API:")
        print(f"Email: {email}")
        print(f"Password: {password}\n")
        print("You can now go to http://localhost:3000/login and use these credentials to log in immediately.")
    except Exception as e:
        print(f"Failed to create user: {e}")

if __name__ == "__main__":
    main()
