import { useSyncExternalStore } from "react";
import { weekMissions } from "../data/missions";
import { getProgress, missionProgress, subscribeProgress } from "../lib/storage";

export function Missions() {
  const progress = useSyncExternalStore(subscribeProgress, getProgress, getProgress);
  return (
    <ul className="missions">
      {weekMissions(progress.week.id).map((mission) => {
        const value = Math.min(mission.target, missionProgress(progress, mission.kind));
        return (
          <li key={mission.kind}>
            <div className="line">
              <span className={value >= mission.target ? "good" : undefined}>{mission.title}</span>
              <span className="tag">
                {value} / {mission.target}
              </span>
            </div>
            <div className="bar" aria-hidden="true">
              <span style={{ width: `${(value / mission.target) * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
