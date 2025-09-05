import React, { useState } from "react";

interface SnapQuizLogoProps {
  size?: string;
  className?: string;
}

export const SnapQuizLogo: React.FC<SnapQuizLogoProps> = ({
  size = 120,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    // Fallback text logo
    return (
      <div className={`snapquiz-logo snapquiz-text-logo ${className}`}>
        <span className="logo-snap">Snap</span>
        <span className="logo-quiz">Quiz</span>
      </div>
    );
  }

  return (
    <div className={`snapquiz-logo ${className}`} style={{ maxWidth: '100%' }}>
      <img
        src="./logo.png"
        alt="SnapQuiz"
        className="logo-image"
        style={{
          height: size,
          width: "auto",
          maxWidth: "100%",
          objectFit: "contain",
        }}
        onError={handleImageError}
      />
    </div>
  );
};
