import "./ImageDisplay.css";

interface IImageDisplayProps {
  image: string;
}

export const ImageDisplay: React.FC<IImageDisplayProps> = ({ image }) => {
  return (
    <div className="image-display">
      <img src={`${import.meta.env.BASE_URL}img/${image}`} alt="img" />
    </div>
  );
};
