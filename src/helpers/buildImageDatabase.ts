const getFolderName = (path: string) => {
  const splitFolder = path.split("/");
  const hasFolder = !!splitFolder[1];
  if (!hasFolder) {
    return "unknown";
  }
  splitFolder.pop();
  return splitFolder.join("/");
};

export const buildImageDatabase = (images: string[]) => {
  const imageDatabase: { [key: string]: string[] } = {};
  images.forEach((path: string) => {
    const folder = getFolderName(path);
    if (!imageDatabase[folder]) {
      imageDatabase[folder] = [];
    }
    imageDatabase[folder].push(path);
  });
  return imageDatabase;
};
