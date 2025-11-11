import React from 'react';
import './App.css';
import {buildImageDatabase, ImageDatabase} from './helpers/buildImageDatabase';
import {ImageRandomizer} from './ImageRandomizer';
import {CategoryPicker} from './CategoryPicker';

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

    return (
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
                />
            )}
        </div>
    );
}

export default App;
