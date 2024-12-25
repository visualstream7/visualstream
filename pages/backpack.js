import React, { useState } from "react";

function CropBackpack() {
  const [imageUrl, setImageUrl] = useState("");
  const [croppedImage, setCroppedImage] = useState(null);

  const handleCrop = async () => {
    if (!imageUrl) {
      alert("Please enter a valid image URL.");
      return;
    }

    try {
      const response = await fetch("/api/crop-backpack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to crop the image.");
      }

      const data = await response.json();

      setCroppedImage(data.image);
      console.log("Cropped image data:", data);
    } catch (error) {
      console.error("Error cropping the image:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Crop Backpack Image</h1>

      <input
        type="text"
        placeholder="Enter Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        style={{ width: "300px", padding: "10px", marginBottom: "10px" }}
      />
      <br />
      <button
        onClick={handleCrop}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        Crop Image
      </button>

      <div style={{ marginTop: "20px" }}>
        {croppedImage && (
          <div>
            <h3>Cropped Image:</h3>
            <img
              src={croppedImage}
              alt="Cropped"
              style={{ maxWidth: "100%", maxHeight: "400px" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CropBackpack;
