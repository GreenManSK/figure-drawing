import React from "react";

interface ICategoryPickerProps {
  imageDatabase: { [key: string]: string[] };
  setFilteredImages: (filtered: { [key: string]: string[] }) => void;
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
  // Create form that is list of checkboxes to filter images
  // Store selected categories in localStorage to restore them when user gets back to the page
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    () => {
      const storedCategories = localStorage.getItem("selectedCategories");
      return storedCategories ? JSON.parse(storedCategories) : [];
    }
  );

  React.useEffect(() => {
    localStorage.setItem(
      "selectedCategories",
      JSON.stringify(selectedCategories)
    );
  }, [selectedCategories]);

  const handleCategoryChange = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleShowImages = () => {
    const filteredImages: { [key: string]: string[] } = {};
    selectedCategories.forEach((category) => {
      filteredImages[category] = imageDatabase[category];
    });
    setFilteredImages(filteredImages);
    setShowImages(true);
  };

  const groupCategories = (categories: string[]) => {
    const grouped: { [key: string]: string[] } = {};
    categories.forEach((category) => {
      const group = category.split("/")[0];
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
      <form className="space-y-4">
        {Object.entries(groupedCategories).map(([group, groupCategories]) => (
          <div key={group} className="mb-4">
            <strong className="text-lg font-semibold text-gray-700">
              {group}
            </strong>
            <br />
            {groupCategories.map((category) => (
              <label key={category} className="block text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                {category.replace(`${group}/`, "")}
              </label>
            ))}
          </div>
        ))}

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
            onChange={(e) => setTimerInSeconds(Number(e.target.value))}
            value={timerInSeconds}
          />
        </label>
      </form>
      <button
        onClick={handleShowImages}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Show
      </button>
    </div>
  );
};
