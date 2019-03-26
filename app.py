from flask import Flask, jsonify, request
import rostalker

app = Flask(__name__)


@app.route("/", methods=['GET', 'POST'])
def index():
    if(request.method == 'POST'):
        some_json = request.get_json()
        return jsonify({'you sent': some_json}), 201
    else:
        return jsonify({"about": "Welcome to my application!"})


@app.route("/StartTalker/")
def run_talker():
    print("Request Received!!!")
    rostalker.start()
    return jsonify({'Status': 'started talker'}), 201


@app.route("/multi/<int:num>", methods=['GET'])
def get_multiply10(num):
    return jsonify({"result": num * 10})


if __name__ == "__main__":
    app.run(debug=False, host='192.168.0.10', port=8080)
