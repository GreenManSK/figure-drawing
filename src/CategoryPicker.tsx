import React from 'react';
import {useTogglContext} from './TogglContext';
import { unlockAudio } from './audio';

interface ICategoryPickerProps {
    imageDatabase: {[key: string]: string[]};
    setFilteredImages: (filtered: {[key: string]: string[]}) => void;
    setShowImages: (showImages: boolean) => void;
    setLimit: (limit: number) => void;
    limit: number;
    timerInSeconds: number;
    setTimerInSeconds: (timer: number) => void;
}

export const CategoryPicker: React.FC<ICategoryPickerProps> = ({
    imageDatabase,
    setFilteredImages,
    setShowImages,
    setLimit,
    limit,
    timerInSeconds,
    setTimerInSeconds,
}) => {
    const {apiKey, setApiKey, isTogglApiEnabled, setIsTogglApiEnabled} = useTogglContext();

    // Create form that is list of checkboxes to filter images
    // Store selected categories in localStorage to restore them when user gets back to the page
    const [selectedCategories, setSelectedCategories] = React.useState<
        string[]
    >(() => {
        const storedCategories = localStorage.getItem('selectedCategories');
        return storedCategories ? JSON.parse(storedCategories) : [];
    });

    const [enableFullscreen, setEnableFullscreen] = React.useState<boolean>(
        () => {
            const storedFullscreen = localStorage.getItem('enableFullscreen');
            return storedFullscreen ? JSON.parse(storedFullscreen) : true;
        }
    );

    React.useEffect(() => {
        localStorage.setItem(
            'selectedCategories',
            JSON.stringify(selectedCategories)
        );
    }, [selectedCategories]);

    React.useEffect(() => {
        localStorage.setItem(
            'enableFullscreen',
            JSON.stringify(enableFullscreen)
        );
    }, [enableFullscreen]);

    const handleCategoryChange = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(
                selectedCategories.filter((c) => c !== category)
            );
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const handleShowImages = () => {
        if (enableFullscreen && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
        unlockAudio();
        const filteredImages: {[key: string]: string[]} = {};
        selectedCategories.forEach((category) => {
            filteredImages[category] = imageDatabase[category];
        });
        setFilteredImages(filteredImages);
        setShowImages(true);
    };

    const groupCategories = (categories: string[]) => {
        const grouped: {[key: string]: string[]} = {};
        categories.forEach((category) => {
            const group = category.split('/')[0];
            if (!grouped[group]) {
                grouped[group] = [];
            }
            grouped[group].push(category);
        });
        return grouped;
    };

    const categories = Object.keys(imageDatabase);
    const groupedCategories = groupCategories(categories);

    return (
        <div className="category-picker p-4 bg-gray-100 rounded shadow-md">
            <header className="text-2xl font-bold mb-4 text-gray-700">
                Figure Drawing
            </header>
            <form className="space-y-4">
                <label className="block text-gray-700">
                    Limit:
                    <input
                        type="number"
                        min="0"
                        className="ml-2 p-1 border rounded"
                        onChange={(e) => setLimit(Number(e.target.value))}
                        value={limit}
                    />
                </label>

                <label className="block text-gray-700">
                    Timer (seconds):
                    <input
                        type="number"
                        min="0"
                        className="ml-2 p-1 border rounded"
                        onChange={(e) =>
                            setTimerInSeconds(Number(e.target.value))
                        }
                        value={timerInSeconds}
                    />
                </label>

                <div className="block">
                    <label className="text-gray-700">
                        Toggl API:
                        <input
                            type="text"
                            className="ml-2 p-1 border rounded"
                            onChange={(e) => setApiKey(e.target.value)}
                            value={apiKey}
                            autoComplete="off"
                            data-1p-ignore
                            data-lpignore="true"
                            data-protonpass-ignore="true"
                            placeholder="API key for time tracking"
                            style={{WebkitTextSecurity: 'disc'} as any}
                        />
                    </label>
                    <label className="ml-4 text-gray-700">
                        <input
                            type="checkbox"
                            className="mr-1"
                            checked={isTogglApiEnabled}
                            onChange={(e) => setIsTogglApiEnabled(e.target.checked)}
                        />
                        Enable for session
                    </label>
                </div>

                <label className="flex items-center text-gray-700 cursor-pointer">
                    <input
                        type="checkbox"
                        className="mr-2"
                        checked={enableFullscreen}
                        onChange={(e) => setEnableFullscreen(e.target.checked)}
                    />
                    Enable fullscreen when showing images
                </label>

                <button
                    onClick={handleShowImages}
                    className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                    Show
                </button>

                {Object.entries(groupedCategories).map(
                    ([group, groupCategories]) => (
                        <div key={group} className="mb-4">
                            <strong className="text-lg font-semibold text-gray-700">
                                {group}
                            </strong>
                            <br />
                            {groupCategories.map((category) => (
                                <label
                                    key={category}
                                    className="block text-gray-600"
                                >
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={selectedCategories.includes(
                                            category
                                        )}
                                        onChange={() =>
                                            handleCategoryChange(category)
                                        }
                                    />
                                    {category.replace(`${group}/`, '')}
                                </label>
                            ))}
                        </div>
                    )
                )}
            </form>
        </div>
    );
};
