import { useMemo } from "react";
import { Screen } from "../components/Screen";
import { localDateKey } from "../lib/format";
import { dDay, dayLabel, tonightPlanets, upcomingSkyEvents } from "../lib/tonight";

export function EventsScreen() {
  const today = localDateKey();
  const planets = useMemo(() => tonightPlanets(new Date()), [today]);
  const events = useMemo(() => upcomingSkyEvents(new Date(), 90), [today]);

  return (
    <Screen banner="events">
      <h1>하늘 달력</h1>
      <p className="lede">서울에서 맨눈으로 볼 수 있는 하늘 소식이에요. 앱 안에서 계산해서, 인터넷 없이도 보여요.</p>

      <section className="card">
        <h2>오늘 밤 행성</h2>
        {planets.length === 0 ? (
          <p className="muted">오늘 밤에는 맨눈으로 보기 좋은 행성이 없어요.</p>
        ) : (
          <ul className="list plain">
            {planets.map((planet) => (
              <li key={planet.id}>
                <strong>{planet.name}</strong>
                <p className="muted">
                  {planet.when} {planet.dir} 하늘, 땅에서 {Math.round(planet.alt)}도 높이
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="label">행성은 별처럼 반짝이지 않고 조용히 빛나요.</p>
      </section>

      <h2>앞으로 석 달</h2>
      <ul className="list">
        {events.map((event) => (
          <li key={event.key}>
            <div>
              <div className="line">
                <strong>{event.title}</strong>
                <span className="tag tag-on">{dDay(event.day, today)}</span>
              </div>
              <p className="label">{dayLabel(event.day)}</p>
              <p>{event.line}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="muted">날짜는 한국 시간이에요. 구름과 불빛에 따라 보이는 정도가 달라요.</p>
    </Screen>
  );
}
