from flask import Flask

app = Flask("pc-monitor")

@app.route("/")
def status():
    return "<p>API is running !</p>"

@app.route("/data" , methods=['POST'])
def fetch_data():
    return True

@app.route("/login", methods=["POST"])
def login():
    return True



if __name__ == '__main__' :
    app.run('127.0.0.1',5000)