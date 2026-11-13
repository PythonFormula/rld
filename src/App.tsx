import { useEffect, useState } from "react";
import { Launch } from "./launch";

function NumToTOffset(num: number): string {
  const sign = num >= 0 ? "+" : "-";
  num = Math.abs(num);
  const seconds = Math.floor(num / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `T${sign}${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;
}

function Timer(time: Date): string {
  const now = new Date().getTime();
  const launch = time.getTime();
  const diff = Math.abs(now - launch);
  return NumToTOffset(launch < now ? diff : -diff);
}

function App() {
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="container">
      <div className="row">
        <h1 style={{ fontSize: "8rem" }} className="text-center">
          {launch == null ? "--:--:--" : Timer(launch.getTime())}
        </h1>
      </div>
      <div className="row justify-content-center">
        <div className="col-auto">
          <div className="input-group">
            <input
              type="file"
              className="form-control"
              accept=".yaml,.yml,application/x-yaml,text/yaml"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setLaunch(new Launch(await file.text()));
              }}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => launch?.toggleHold()}
            >
              Hold
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => launch?.scrub()}
            >
              Scrub
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => launch?.recycle()}
            >
              Recycle (T-60)
            </button>
            <label htmlFor="delay" className="input-group-text">
              Stream delay
            </label>
            <input
              type="number"
              className="form-control"
              id="delay"
              autoComplete="off"
              onChange={(e) => {
                if (launch) launch.delayOffset = Number(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <div className="row">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Event</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {launch == null ? (
              <></>
            ) : (
              launch.timeline.map((e, i) => (
                <tr
                  className={
                    i === launch.nextEventIndex() ? "theme-inverse" : undefined
                  }
                >
                  <td>{NumToTOffset(e.time)}</td>
                  <td>{e.name}</td>
                  <td>
                    {Timer(new Date(launch.getTime().getTime() + e.time))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
