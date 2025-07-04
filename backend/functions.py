import secrets
from dotenv import load_dotenv
import os
from datetime import datetime
import psutil, time, bcrypt

load_dotenv()
BASE_URL = os.getenv("BASE_URL")
PORT = int(os.getenv("PORT"))

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
    exp_time = int(time.time()) + 86400   # valid 1 day
    write_to_env("API_TOKEN",token)
    write_to_env("TOKEN_EXP",exp_time)

def is_token_valid(token, request_time):
    return token == os.getenv("API_TOKEN") and request_time < int(os.getenv("TOKEN_EXP"))

def hash_password(pwd):
    return bcrypt.hashpw(pwd.encode(), bcrypt.gensalt()).decode()

def is_credential_valid(username, pwd):
    return username == os.getenv("DASH_USER") and bcrypt.checkpw(pwd.encode(), os.getenv("DASH_PWD").encode())

def get_token():
    return {"token" : os.getenv("API_TOKEN"), "expire" : int(os.getenv("TOKEN_EXP"))}

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

def get_network_info():
    net_io = psutil.net_io_counters()
    network_info = {
        "sent" : net_io.bytes_sent,
        "received" : net_io.bytes_recv
    }
    return network_info


def get_running_apps(limit=15):
    process_dict = {}

    for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_info']):
        try:
            proc_info = proc.info
            process_dict[proc_info['pid']] = {
                'name': proc_info['name'],
                'username': proc_info['username'],
                'cpuPercent': proc_info['cpu_percent'],
                'memUsage': proc_info['memory_info'].rss
            }
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
        
    sorted_items = sorted(
        process_dict.items(), 
        key=lambda item: (item[1]['memUsage'], item[1]['cpuPercent']),
        reverse=True
    )
    sorted_dict = {pid: data for pid, data in sorted_items[:limit]}
    return sorted_dict

def get_data():
    data = {
        "cpu" : get_cpu_info(),
        "ram" : get_ram_info(),
        "disk" : get_disk_info(),
        "network" : get_network_info(),
        "apps" : get_running_apps()
    } 
    return data