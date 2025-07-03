from flask import Flask, request, jsonify
from flask_cors import CORS
from functions import *


app = Flask("pc-monitor")
CORS(app)

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
        "data": get_data(),
        "timestamp": int(time.time())
    })

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if is_credential_valid(username,password):
        generate_token()
        return jsonify(get_token())
    
    return jsonify({"error": "Invalid credentials"}), 401



if __name__ == '__main__' :
    app.run(host=BASE_URL, port=PORT)