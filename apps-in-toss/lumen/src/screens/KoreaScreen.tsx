import { Screen } from "../components/Screen";
import { KOREAN_STORIES } from "../data/korean";
import { CONSTELLATION_META } from "../data/constellations";
import type { ScreenId } from "../screenIds";

export function KoreaScreen({ open }: { open: (screen: ScreenId, focus?: string) => void }) {
  return (
    <Screen banner="korea">
      <h1>우리 별 이야기</h1>
      <p className="lede">우리 옛사람들이 보고, 새기고, 이야기로 남긴 하늘이에요.</p>
      <ul className="list">
        {KOREAN_STORIES.map((story) => {
          const focus = story.focus ? CONSTELLATION_META.find((item) => item.id === story.focus) : undefined;
          return (
            <li key={story.id}>
              <div>
                <strong>{story.title}</strong>
                <p className="label">{story.when}</p>
                <p className="story-body">{story.body}</p>
                {focus ? (
                  <button type="button" className="btn btn-quiet story-btn" onClick={() => open("sky", focus.id)}>
                    {focus.name} 하늘에서 보기
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="muted">"우리 하늘" 퀴즈로 이야기를 다시 떠올려 보세요.</p>
    </Screen>
  );
}
