/* eslint-disable no-restricted-globals */
import {FC, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ImageDisplay} from './ImageDisplay';
import './ImageRandomizer.css';
import {useTogglContext, useTogglRequest} from './TogglContext';
import {limitReachedAudio, nextImageAudio} from './audio';

interface IImageDisplayProps {
    imageCategories: {[key: string]: string[]};
    setShowImages: (showImages: boolean) => void;
    limit?: number;
    timerInSeconds: number;
}

const MEMORY_SIZE = 50;

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

    const [randomImage, setRandomImage] = useState<string>('');
    const usedImagesRef = useRef<string[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [completedCount, setCompletedCount] = useState(0);
    const [stopLimit, setStopLimit] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const timerRef = useRef<number | null>(null);
    const [remainingTime, setRemainingTime] = useState(timerInSeconds * 1000);
    const lastTickRef = useRef<number | null>(null);

    const {workspaceId} = useTogglContext();
    const togglRequest = useTogglRequest();
    const toggleTimerIdRef = useRef<string | undefined>(undefined);
    const togglApiRunningRef = useRef<boolean>(false);
    const startTogglTimer = () => {
        if (!workspaceId || togglApiRunningRef.current) {
            return;
        }
        togglApiRunningRef.current = true;
        togglRequest('time_entries', 'POST', {
            created_with: 'Figure Drawing API',
            description: 'Figure Drawing',
            tags: [],
            billable: false,
            workspace_id: +workspaceId, // replace with your actual workspace_id
            duration: -1,
            start: new Date().toISOString(),
            stop: null,
        }).then((data: any) => {
            togglApiRunningRef.current = false;
            toggleTimerIdRef.current = data.id;
        });
    };
    const stopTogglTimer = () => {
        if (!toggleTimerIdRef.current) {
            return;
        }
        togglRequest(`time_entries/${toggleTimerIdRef.current}/stop`, 'PATCH');
        toggleTimerIdRef.current = undefined;
    };

    const chooseRandomImage = useCallback(
        (increaseCount: boolean) => {
            if (usedImagesRef.current.length === images.length) {
                alert('Just pick something already!');
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
        startTogglTimer();
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
                    setIsPaused(true);
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
                'You have completed the limit. Do you want to stop?'
            );
            if (shouldStop) {
                setShowImages(false);
            } else {
                setStopLimit(true);
            }
        }
    }, [completedCount, limit, setShowImages, stopLimit]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            stopTogglTimer();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const togglePause = () => {
        if (!isPaused) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            stopTogglTimer();
            const elapsed = Date.now() - (lastTickRef.current || Date.now());
            setRemainingTime((prev) => Math.max(prev - elapsed, 0));
        } else {
            startTogglTimer();
        }
        setIsPaused((prev) => !prev);
    };

    const close = () => {
        setShowImages(false);
        stopTogglTimer();
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    };

    return (
        <div className="image-randomizer flex flex-col h-screen text-white w-full">
            <div
                id="controls"
                className="flex justify-center items-center gap-4 p-2 flex-wrap sm:flex-nowrap text-base sm:text-lg"
            >
                <button
                    onClick={goToPreviousImage}
                    disabled={history.length <= 1}
                    className={btn}
                >
                    Prev
                </button>
                <button onClick={close} className={btn}>
                    Close
                </button>
                {timerInSeconds ? (
                    <button onClick={togglePause} className={btn}>
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>
                ) : null}
                <span className="counter text-lg font-semibold">
                    {limit
                        ? `${completedCount + 1} / ${limit}`
                        : completedCount + 1}
                </span>
                <button
                    onClick={() => {
                        chooseRandomImage(false);
                        setRemainingTime(timerInSeconds * 1000);
                    }}
                    className={btnSkip}
                >
                    Skip
                </button>
                <button
                    onClick={() => {
                        chooseRandomImage(true);
                        setRemainingTime(timerInSeconds * 1000);
                    }}
                    className={btn}
                >
                    Next
                </button>
            </div>
            <div className="flex-grow flex items-center justify-center sm:max-h-[calc(100dvh-60px)] max-h-[calc(100dvh-48px)] max-w-full bg-gray-950 w-full relative">
                {randomImage && (
                    <ImageDisplay
                        image={randomImage}
                        onImageLoad={() => setIsPaused(false)}
                    />
                )}
                {remainingTime ? (
                    <div className="absolute top-4 right-4 bg-black/60 text-white text-4xl font-bold px-4 py-2 rounded-lg shadow-lg">
                        {Math.ceil(remainingTime / 1000)}s
                    </div>
                ) : null}
            </div>
        </div>
    );
};

// Tailwind utility class for buttons
const btn =
    'px-3 py-1 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed';

const btnSkip =
    'px-3 py-1 sm:px-4 sm:py-2 bg-pink-500 hover:bg-pink-700 text-white font-medium rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105';
