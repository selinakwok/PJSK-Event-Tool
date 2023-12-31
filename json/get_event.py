import json
import requests
import urllib.request
import numpy as np
import pandas as pd

api = "https://api.sekai.best/event/"
query = "/rankings/graph?region=tw&rank="
events_url = "https://sekai-world.github.io/sekai-master-db-tc-diff/events.json"
response = urllib.request.urlopen(events_url)
events_json = json.loads(response.read())

json_write = []
for rank in [100, 200, 300, 400, 500, 1000, 2000, 3000, 4000, 5000, 10000]:
    event = 36
    while event < 67:
        if event in [40, 42, 54, 55, 56, 58]:
            event += 1
            continue

        res = json.loads(requests.get(api + str(event) + query + str(rank)).text)["data"]["eventRankings"]
        data = pd.DataFrame(res)
        timestamps = pd.to_datetime(data["timestamp"]).values.astype(np.int64) // 10 ** 6
        scores = data["score"].values

        start_time = 0
        for i in events_json:
            if i["id"] == event:
                start_time = i["startAt"]
                break
        timestamps = [(t - start_time)/1000 for t in timestamps]  # no of seconds from start of event
        scores = scores.tolist()
        json_write.append({
            "eid": event,
            "times": timestamps,
            "scores": scores
        })
        print("event " + str(event) + " done")
        event += 1

    print(json_write)
    with open("r" + str(rank) + ".json", 'w') as f:
        json.dump(json_write, f, indent=4)





