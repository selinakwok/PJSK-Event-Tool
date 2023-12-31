from flask import Flask, request
import flask
import json
import requests
import urllib.request
import pandas as pd
import numpy as np
from flask_cors import CORS
from scipy.spatial.distance import euclidean

app = Flask(__name__)
CORS(app)


live_api = "https://api.sekai.best/event/live?region=tw&rank="
event_api = "https://api.sekai.best/event/"
event_query = "rankings/graph?region=tw&rank="
events_url = "https://sekai-world.github.io/sekai-master-db-tc-diff/events.json"
response = urllib.request.urlopen(events_url)
events_json = json.loads(response.read())


@app.route("/")
def test():
    return "Hello world"


@app.route("/predict", methods=["GET", "POST"])
def predict():
    if request.method == "POST":
        received_data = request.get_json()
        print(f"received data: {received_data}")
        rank = received_data['rank']
        live_eid = json.loads(requests.get(live_api + str(rank)).text)["data"]["eventRankings"][0]["eventId"]

        res = json.loads(requests.get(event_api + str(live_eid) + event_query + str(rank)).text)["data"]["eventRankings"]
        data = pd.DataFrame(res)
        timestamps = pd.to_datetime(data["timestamp"]).values.astype(np.int64) // 10 ** 6
        start_time = 0
        for i in events_json:
            if i["id"] == live_eid:
                start_time = i["startAt"]
                break
        timestamps = [(t - start_time)/1000 for t in timestamps]  # no of seconds from start of event
        scores = data["score"].values

        return_data = {
            "status": "success",
            "message": f"received: {rank}"
        }
        return flask.Response(response=json.dumps(return_data), status=201)


if __name__ == "__main__":
    app.run("localhost", 8000)
