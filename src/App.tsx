import React from "react";
import "./App.css";
import { buildImageDatabase } from "./helpers/buildImageDatabase";
import { ImageRandomizer } from "./ImageRandomizer";
import { CategoryPicker } from "./CategoryPicker";
import data from "./image-list.json";

function App() {
  const imageDatabase = React.useMemo(() => {
    return buildImageDatabase(data);
  }, []);

  const [showImages, setShowImages] = React.useState(false);
  const [filteredImages, setFilteredImages] = React.useState(imageDatabase);
  const [limit, setLimit] = React.useState(() => {
    const storedLimit = localStorage.getItem("limit");
    return storedLimit ? parseInt(storedLimit, 10) : 0;
  });
  const [timerInSeconds, setTimerInSeconds] = React.useState(() => {
    const storedTimer = localStorage.getItem("timerInSeconds");
    return storedTimer ? parseInt(storedTimer, 10) : 0;
  });

  React.useEffect(() => {
    localStorage.setItem("limit", limit.toString());
  }, [limit]);
  React.useEffect(() => {
    localStorage.setItem("timerInSeconds", timerInSeconds.toString());
  }, [timerInSeconds]);

  return showImages ? (
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
  );
}

export default App;
