import { useEffect, useState } from "react";
import { allStamps } from "../data/quizzes";
import { haptic } from "../lib/haptic";
import { onStampAwarded } from "../lib/storage";

/** 도장을 받으면 화면 아래에 도장이 꾹 찍히는 모습을 잠깐 보여 주고 진동합니다. */
export function StampToast() {
  const [queue, setQueue] = useState<string[]>([]);
  const current = queue[0];

  useEffect(() => onStampAwarded((id) => setQueue((items) => [...items, id])), []);

  useEffect(() => {
    if (!current) return;
    haptic("success");
    const timer = window.setTimeout(() => setQueue((items) => items.slice(1)), 2400);
    return () => window.clearTimeout(timer);
  }, [current]);

  if (!current) return null;
  const stamp = allStamps().find((item) => item.id === current);
  if (!stamp) return null;
  return (
    <div className="stamp-toast" role="status" aria-live="polite" key={current}>
      <span className="stamp-press" aria-hidden="true">
        {stamp.name.slice(0, 1)}
      </span>
      <div>
        <strong>도장 쾅!</strong>
        <p>{stamp.name} 도장을 받았어요.</p>
      </div>
    </div>
  );
}
