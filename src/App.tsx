import React from 'react';
import './App.css';
import {buildImageDatabase, ImageDatabase} from './helpers/buildImageDatabase';
import {ImageRandomizer} from './ImageRandomizer';
import {CategoryPicker} from './CategoryPicker';
import {TogglProvider} from './TogglContext';
import {maxRecentTimers as defaultMaxRecentTimers} from './config';

function App() {
    const [imageDatabase, setImageDatabase] = React.useState<ImageDatabase>({});
    const [showImages, setShowImages] = React.useState(false);
    const [filteredImages, setFilteredImages] = React.useState<ImageDatabase>(
        {}
    );
    const [limit, setLimit] = React.useState(() => {
        const storedLimit = localStorage.getItem('limit');
        return storedLimit ? parseInt(storedLimit, 10) : 0;
    });
    const [timerInSeconds, setTimerInSeconds] = React.useState(() => {
        const storedTimer = localStorage.getItem('timerInSeconds');
        return storedTimer ? parseInt(storedTimer, 10) : 0;
    });
    const [recentTimers, setRecentTimers] = React.useState<number[]>(() => {
        const storedRecentTimers = localStorage.getItem('recentTimers');
        return storedRecentTimers ? JSON.parse(storedRecentTimers) : [];
    });
    const [maxRecentTimers, setMaxRecentTimers] = React.useState(() => {
        const storedMaxRecentTimers = localStorage.getItem('maxRecentTimers');
        return storedMaxRecentTimers ? parseInt(storedMaxRecentTimers, 10) : defaultMaxRecentTimers;
    });

    React.useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}image-list.json`)
            .then((response) => response.json())
            .then((data) => {
                console.log('Fetched image list:', data);
                const database = buildImageDatabase(data);
                setImageDatabase(database);
                setFilteredImages(database);
            })
            .catch((error) =>
                console.error('Error fetching image list:', error)
            );
    }, []);

    React.useEffect(() => {
        localStorage.setItem('limit', limit.toString());
    }, [limit]);

    React.useEffect(() => {
        localStorage.setItem('timerInSeconds', timerInSeconds.toString());
    }, [timerInSeconds]);

    React.useEffect(() => {
        localStorage.setItem('recentTimers', JSON.stringify(recentTimers));
    }, [recentTimers]);

    React.useEffect(() => {
        localStorage.setItem('maxRecentTimers', maxRecentTimers.toString());
    }, [maxRecentTimers]);

    // Truncate recentTimers when maxRecentTimers is reduced
    React.useEffect(() => {
        if (recentTimers.length > maxRecentTimers) {
            setRecentTimers((prev) => prev.slice(0, maxRecentTimers));
        }
    }, [maxRecentTimers]);

    const addToRecentTimers = (timer: number) => {
        if (timer <= 0) return; // Don't add 0 or negative values

        setRecentTimers((prev) => {
            // Remove the timer if it already exists
            const filtered = prev.filter((t) => t !== timer);
            // Add the new timer at the beginning
            const updated = [timer, ...filtered];
            // Keep only the max number of recent timers
            return updated.slice(0, maxRecentTimers);
        });
    };

    return (
        <TogglProvider>
            <div className="flex justify-center items-center bg-gray-900 text-white min-h-screen">
                {showImages ? (
                    <ImageRandomizer
                        imageCategories={filteredImages}
                        setShowImages={setShowImages}
                        limit={limit}
                        timerInSeconds={timerInSeconds}
                    />
                ) : (
                    <CategoryPicker
                        imageDatabase={imageDatabase}
                        setFilteredImages={setFilteredImages}
                        setShowImages={setShowImages}
                        setLimit={setLimit}
                        limit={limit}
                        timerInSeconds={timerInSeconds}
                        setTimerInSeconds={setTimerInSeconds}
                        recentTimers={recentTimers}
                        addToRecentTimers={addToRecentTimers}
                        maxRecentTimers={maxRecentTimers}
                        setMaxRecentTimers={setMaxRecentTimers}
                    />
                )}
            </div>
        </TogglProvider>
    );
}

export default App;
