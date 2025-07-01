from flask import Flask, request, jsonify
from functions import *


app = Flask("pc-monitor")

@app.route("/")
def status():
    return "<p>API is running !</p>"

@app.route("/data" , methods=['POST'])
def fetch_data():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    now = int(time.time())

    if not token or not is_token_valid(token, now):
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify({
        "status": "ok",
        "data": fetch_data(),
        "timestamp": int(time.time())
    })

@app.route("/login", methods=["POST"])
def login():
    return True



if __name__ == '__main__' :
    app.run('127.0.0.1',5000)