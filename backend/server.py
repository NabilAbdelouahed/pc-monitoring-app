from flask import Flask

app = Flask("pc-monitor")

@app.route("/")
def hello_world():
    return "<p>API is running !</p>"

if __name__ == '__main__' :
    app.run('127.0.0.1',5000)