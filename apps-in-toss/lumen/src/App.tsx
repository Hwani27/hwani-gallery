import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { closeView, graniteEvent } from "@apps-in-toss/web-framework";
import { HomeScreen } from "./screens/HomeScreen";
import type { ScreenId } from "./screenIds";
import { playTap } from "./lib/audio";
import { getProgress, onStampAwarded } from "./lib/storage";
import { submitStampScore } from "./lib/leaderboard";
import { trackScreen } from "./lib/track";
import { StampToast } from "./components/StampToast";

const JourneyScreen = lazy(() => import("./screens/JourneyScreen").then((mod) => ({ default: mod.JourneyScreen })));
const WeightScreen = lazy(() => import("./screens/WeightScreen").then((mod) => ({ default: mod.WeightScreen })));
const RaceScreen = lazy(() => import("./screens/RaceScreen").then((mod) => ({ default: mod.RaceScreen })));
const IssScreen = lazy(() => import("./screens/IssScreen").then((mod) => ({ default: mod.IssScreen })));
const SkyScreen = lazy(() => import("./screens/SkyScreen").then((mod) => ({ default: mod.SkyScreen })));
const QuizScreen = lazy(() => import("./screens/QuizScreen").then((mod) => ({ default: mod.QuizScreen })));
const StampsScreen = lazy(() => import("./screens/StampsScreen").then((mod) => ({ default: mod.StampsScreen })));
const EventsScreen = lazy(() => import("./screens/EventsScreen").then((mod) => ({ default: mod.EventsScreen })));
const ConnectScreen = lazy(() => import("./screens/ConnectScreen").then((mod) => ({ default: mod.ConnectScreen })));
const OrderScreen = lazy(() => import("./screens/OrderScreen").then((mod) => ({ default: mod.OrderScreen })));
const KoreaScreen = lazy(() => import("./screens/KoreaScreen").then((mod) => ({ default: mod.KoreaScreen })));
const CardsScreen = lazy(() => import("./screens/CardsScreen").then((mod) => ({ default: mod.CardsScreen })));
const SizeScreen = lazy(() => import("./screens/SizeScreen").then((mod) => ({ default: mod.SizeScreen })));

type HistoryState = { lumen?: ScreenId };

export function App() {
  const [screen, setScreen] = useState<ScreenId>("home");
  const [focus, setFocus] = useState<string | null>(null);
  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    trackScreen(screen);
  }, [screen]);

  useEffect(() => onStampAwarded(() => submitStampScore(getProgress().stamps.length)), []);

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

  return (
    <>
    <Suspense fallback={<p className="boot-fallback" role="status">화면을 불러오고 있어요</p>}>
      {screen === "home" ? <HomeScreen open={open} /> : null}
      {screen === "journey" ? <JourneyScreen /> : null}
      {screen === "weight" ? <WeightScreen initial={getProgress().weightKg} /> : null}
      {screen === "race" ? <RaceScreen /> : null}
      {screen === "iss" ? <IssScreen /> : null}
      {screen === "sky" ? <SkyScreen focusId={focus} /> : null}
      {screen === "quiz" ? <QuizScreen /> : null}
      {screen === "size" ? <SizeScreen /> : null}
      {screen === "stamps" ? <StampsScreen /> : null}
      {screen === "events" ? <EventsScreen /> : null}
      {screen === "connect" ? <ConnectScreen open={open} /> : null}
      {screen === "order" ? <OrderScreen /> : null}
      {screen === "korea" ? <KoreaScreen open={open} /> : null}
      {screen === "cards" ? <CardsScreen open={open} /> : null}
    </Suspense>
    <StampToast />
    </>
  );
}
