import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { closeView, graniteEvent } from "@apps-in-toss/web-framework";
import { HomeScreen } from "./screens/HomeScreen";
import type { ScreenId } from "./screenIds";
import { playTap } from "./lib/audio";
import { getProgress } from "./lib/storage";

const JourneyScreen = lazy(() => import("./screens/JourneyScreen").then((mod) => ({ default: mod.JourneyScreen })));
const WeightScreen = lazy(() => import("./screens/WeightScreen").then((mod) => ({ default: mod.WeightScreen })));
const RaceScreen = lazy(() => import("./screens/RaceScreen").then((mod) => ({ default: mod.RaceScreen })));
const IssScreen = lazy(() => import("./screens/IssScreen").then((mod) => ({ default: mod.IssScreen })));
const SkyScreen = lazy(() => import("./screens/SkyScreen").then((mod) => ({ default: mod.SkyScreen })));
const QuizScreen = lazy(() => import("./screens/QuizScreen").then((mod) => ({ default: mod.QuizScreen })));
const SizeScreen = lazy(() => import("./screens/SizeScreen").then((mod) => ({ default: mod.SizeScreen })));

type HistoryState = { lumen?: ScreenId };

export function App() {
  const [screen, setScreen] = useState<ScreenId>("home");
  const [focus, setFocus] = useState<string | null>(null);
  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    const onPop = () => {
      const state = history.state as HistoryState | null;
      setScreen(state?.lumen ?? "home");
    };
    window.addEventListener("popstate", onPop);
    let unsubscribe = () => {};
    try {
      unsubscribe = graniteEvent.addEventListener("backEvent", {
        onEvent: () => {
          const state = history.state as HistoryState | null;
          if (screenRef.current !== "home" && state?.lumen) {
            history.back();
            return;
          }
          void closeView().catch(() => {});
        },
        onError: () => {},
      });
    } catch {
      /* browser preview has no Toss bridge */
    }
    return () => {
      window.removeEventListener("popstate", onPop);
      unsubscribe();
    };
  }, []);

  function open(next: ScreenId, nextFocus?: string) {
    playTap();
    setFocus(nextFocus ?? null);
    history.pushState({ lumen: next } satisfies HistoryState, "");
    setScreen(next);
  }

  function home() {
    playTap();
    const state = history.state as HistoryState | null;
    if (state?.lumen) history.back();
    else setScreen("home");
  }

  return (
    <Suspense fallback={<p className="boot-fallback">불러오는 중이에요</p>}>
      {screen === "home" ? <HomeScreen open={open} /> : null}
      {screen === "journey" ? <JourneyScreen onMenu={home} /> : null}
      {screen === "weight" ? <WeightScreen onMenu={home} initial={getProgress().weightKg} /> : null}
      {screen === "race" ? <RaceScreen onMenu={home} /> : null}
      {screen === "iss" ? <IssScreen onMenu={home} /> : null}
      {screen === "sky" ? <SkyScreen onMenu={home} focusId={focus} /> : null}
      {screen === "quiz" ? <QuizScreen onMenu={home} /> : null}
      {screen === "size" ? <SizeScreen onMenu={home} /> : null}
    </Suspense>
  );
}
