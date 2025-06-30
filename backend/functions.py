import secrets
from dotenv import load_dotenv
import os
from datetime import datetime
import psutil

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

def get_cpu_info():
    cpu_info = {
        "physicalCores" : psutil.cpu_count(logical=False),
        "totalCores" : psutil.cpu_count(logical=True),
        "cpuUsagePerCore" : {i : percentage 
                            for i, percentage in enumerate(psutil.cpu_percent(percpu=True, interval=1))},
        "totalCpuUsage" : psutil.cpu_percent(),
        #"temperature" : {
        #    name: [entry.current for entry in entries]
        #    for name, entries in psutil.sensors_temperatures().items()
        #                }                
    }
    return cpu_info

def get_ram_info():
    svmem = psutil.virtual_memory()
    ram_info = {
        "total" : svmem.total,
        "available" : svmem.available,
        "used" : svmem.used,
        "use_percentage" : svmem.percent
    }
    return ram_info

def get_disk_info():
    disk_info = {}
    partitions = psutil.disk_partitions()
    for partition in partitions:
        device = partition.device
        try :
            usage = psutil.disk_usage(partition.mountpoint)
            disk_info[device] = {
                "total_size" : usage.total,
                "used" : usage.used,
                "free" : usage.free,
                "use_percentage" : usage.percent
            }
        except PermissionError:
            continue
    return disk_info

