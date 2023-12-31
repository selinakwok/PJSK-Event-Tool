import json
import requests
import numpy as np
import pandas as pd
# import matplotlib.pyplot as plt
from datetime import datetime
from scipy.signal import argrelextrema

api = "https://api.sekai.best/event/"
query = "/rankings/graph?region=tw&rank="

json_write = []
for rank in [100, 200, 300, 400, 500, 1000, 2000, 3000, 4000, 5000, 10000]:
    event = 36
    while event < 67:
        if event in [40, 42, 54, 55, 56, 58]:
            event += 1
            continue
        res = json.loads(requests.get(api + str(event) + query + str(rank)).text)["data"]["eventRankings"]
        data = pd.DataFrame(res)
        timestamps = pd.to_datetime(data["timestamp"]).values.astype(np.int64) // 10**6
        scores = data["score"].values
        end_pt = scores[-1]
        end_time = timestamps[-1]
        timestamps_subset = timestamps[-30:]
        scores_subset = scores[-30:]
        d = np.gradient(scores_subset, timestamps_subset)
        d2 = np.gradient(d, timestamps_subset)
        d2_peak = argrelextrema(d2, np.greater_equal, order=3)[0]

        """plt.plot(timestamps, scores, color="r")
        plt.plot(timestamps_subset, scores_subset)
        for i in d2_peak:
            plt.axvline(timestamps_subset[i], color="green")
        # plt.axvline(timestamps_subset[d2_first], color="black")
        # plt.axvline(timestamps_subset[d2_max], color="yellow")
        plt.show()
        plt.plot(timestamps_subset, d2)
        for i in d2_peak:
            plt.axvline(timestamps_subset[i], color="r")
        plt.show()"""

        acc_time = []
        acc_score = []
        i = 0
        for p in d2_peak:
            if i != 0:
                acc_time.append(timestamps_subset[p])
                acc_score.append(scores_subset[p] - scores_subset[d2_peak[i - 1]])
            else:
                acc_time.append(timestamps_subset[p])
            i += 1

        acc_time = [datetime.fromtimestamp(end_time/1000) - datetime.fromtimestamp(ts/1000) for ts in acc_time]  # /1000 to change from milliseconds to seconds
        acc_time = [ts.seconds for ts in acc_time]
        end_pt = end_pt - scores_subset[d2_peak[len(d2_peak) - 1]]  # delta pts from last peak to end

        acc_score = [s.item() for s in acc_score]
        end_pt = end_pt.item()

        json_write.append({
            "eid": event,
            "acc_time": acc_time,
            "acc_pt": acc_score,  # delta pts between peaks
            "end_pt": end_pt
        })

        print("event " + str(event) + " done")
        event += 1
    print(json_write)
    with open("r" + str(rank) + "_acc.json", 'w') as f:
        json.dump(json_write, f, indent=4)


"""data_array = np.column_stack((timestamps, scores))
model = "l2"
algo = rpt.Window(width=4, model=model).fit(data_array)
result = algo.predict(n_bkps=2)
plt.plot(timestamps, scores)
for i in result:
    plt.axvline(timestamps[i-1], color="r")
plt.show()
print("detected change:", result)"""