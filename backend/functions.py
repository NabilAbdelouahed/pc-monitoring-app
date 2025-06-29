import secrets
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

def write_to_env(key,value,filename='.env'):
    try :
        with open(filename, "r") as file:
            lines = file.readlines()

        key_exists = False
        for i, line in enumerate(lines):
            if line.startswith(f"{key}="):
                lines[i] = f"{key}={value}\n"
                key_exists = True
                break
        
        if not key_exists:
            lines.append(f"{key}={value}\n")
        
        with open(filename, "w") as file:
            file.writelines(lines)

        load_dotenv(override=True)
    except  Exception as e:
        print(f"Error writing to {filename}: {e}")

def generate_token():
    token = secrets.token_urlsafe(32)
    current_date = str(datetime.now().date())
    write_to_env("API_TOKEN",token)
    write_to_env("TOKEN_EXP",current_date)

generate_token()