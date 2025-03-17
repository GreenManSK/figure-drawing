/* eslint-disable no-restricted-globals */
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageDisplay } from "./ImageDisplay";
import "./ImageRandomizer.css";

interface IImageDisplayProps {
  imageCategories: { [key: string]: string[] };
  setShowImages: (showImages: boolean) => void;
  limit?: number;
  timerInSeconds: number;
}

const MEMORY_SIZE = 50;

const limitReachedAudio = new Audio(
  import.meta.env.BASE_URL + "limit-reached.mp3"
);
const nextImageAudio = new Audio(import.meta.env.BASE_URL + "next.mp3");

export const ImageRandomizer: FC<IImageDisplayProps> = ({
  imageCategories,
  setShowImages,
  limit,
  timerInSeconds,
}) => {
  const images = useMemo(
    () =>
      Object.values(imageCategories)
        .flat()
        .filter((img) => img),
    [imageCategories]
  );

  const [randomImage, setRandomImage] = useState<string>(images[0]);
  const usedImagesRef = useRef<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [stopLimit, setStopLimit] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [remainingTime, setRemainingTime] = useState(timerInSeconds * 1000);
  const lastTickRef = useRef<number | null>(null);

  const chooseRandomImage = useCallback(
    (increaseCount: boolean) => {
      if (usedImagesRef.current.length === images.length) {
        alert("Just pick something already!");
        usedImagesRef.current = [];
      }
      let randomIndex = 0;
      do {
        randomIndex = Math.floor(Math.random() * images.length);
      } while (usedImagesRef.current.includes(images[randomIndex]));
      usedImagesRef.current.push(images[randomIndex]);

      setHistory((prev) => {
        const newHistory = [...prev, images[randomIndex]];
        return newHistory.length > MEMORY_SIZE
          ? newHistory.slice(1)
          : newHistory;
      });

      setRandomImage(images[randomIndex]);
      if (increaseCount) {
        setCompletedCount((prev) => prev + 1);
      }
    },
    [images]
  );

  const goToPreviousImage = () => {
    setHistory((prev) => {
      if (prev.length > 1) {
        const newHistory = [...prev];
        newHistory.pop();
        setRandomImage(newHistory[newHistory.length - 1]);
        return newHistory;
      }
      return prev;
    });
  };

  useEffect(() => {
    usedImagesRef.current = [];
    setHistory([]);
    chooseRandomImage(false);
  }, [images]);

  useEffect(() => {
    if (timerInSeconds > 0 && !isPaused) {
      const startTime = Date.now();
      lastTickRef.current = startTime;

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - (lastTickRef.current || startTime);
        setRemainingTime((prev) => Math.max(prev - elapsed, 0));
        lastTickRef.current = Date.now();

        if (remainingTime <= 0) {
          chooseRandomImage(true);
          nextImageAudio.play();
          setRemainingTime(timerInSeconds * 1000);
        }
      }, 100);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [timerInSeconds, isPaused, remainingTime, chooseRandomImage]);

  useEffect(() => {
    if (stopLimit) {
      return;
    }
    if (limit && completedCount >= limit) {
      limitReachedAudio.play();

      const shouldStop = confirm(
        "You have completed the limit. Do you want to stop?"
      );
      if (shouldStop) {
        setShowImages(false);
      } else {
        setStopLimit(true);
      }
    }
  }, [completedCount, limit, setShowImages, stopLimit]);

  const togglePause = () => {
    if (!isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      const elapsed = Date.now() - (lastTickRef.current || Date.now());
      setRemainingTime((prev) => Math.max(prev - elapsed, 0));
    }
    setIsPaused((prev) => !prev);
  };

  return (
    <div className="image-randomizer">
      <ImageDisplay image={randomImage} />
      <div>
        <button onClick={goToPreviousImage} disabled={history.length <= 1}>
          Prev
        </button>
        <button onClick={() => setShowImages(false)}>Change</button>
        {timerInSeconds ? (
          <button onClick={togglePause}>{isPaused ? "Resume" : "Pause"}</button>
        ) : null}
        <span className="counter">
          {limit ? `${completedCount} / ${limit}` : completedCount}
        </span>
        <button onClick={() => chooseRandomImage(true)}>Next</button>
        <button onClick={() => chooseRandomImage(false)}>Skip</button>
      </div>
    </div>
  );
};
