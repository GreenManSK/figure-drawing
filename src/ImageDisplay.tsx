import "./ImageDisplay.css";

interface IImageDisplayProps {
  image: string;
  onImageLoad?: () => void; // Added optional callback prop
}

export const ImageDisplay: React.FC<IImageDisplayProps> = ({
  image,
  onImageLoad,
}) => {
  return (
    <img
      className="max-h-full max-w-full"
      src={`${import.meta.env.BASE_URL}img/${image}`}
      alt="img"
      onLoad={onImageLoad} // Invoke callback when image is loaded
    />
  );
};
