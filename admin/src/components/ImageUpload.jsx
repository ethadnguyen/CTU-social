import { React, useState, useEffect } from 'react';

const ImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        setErrorMessage('Kích thước file ảnh phải nhỏ hơn 5MB.');
        setSelectedImage(null);
      } else {
        setErrorMessage(null);
        setSelectedImage(file);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        setErrorMessage('Kích thước file ảnh phải nhỏ hơn 5MB.');
        setSelectedImage(null);
      } else {
        setErrorMessage(null);
        setSelectedImage(file);
      }
    }
  };

  const handleDeleteImage = () => {
    setSelectedImage(null);
    setErrorMessage(null);
  };

    useEffect(() => {
        if(selectedImage)
            console.log(selectedImage);
    }, []);

  return (
    <div className="mt-5">
      
      <div
        className="border border-dashed border-gray rounded-md p-4 flex items-center justify-center relative"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {selectedImage ? (
          <div className="relative">
            <img
            src={URL.createObjectURL(selectedImage)}
            alt="Uploaded"
            className="h-[25%] w-full"
            />

            <span className="text-ascent-1 text-xs absolute top-0 left-0 m-2">
              {selectedImage.name}
            </span>
            <button
              onClick={handleDeleteImage}
              className="absolute top-0 right-0 m-2 bg-red hover:bg-white hover:text-red text-white text-2xl rounded-full px-2 py-1"
            >
              X
            </button>
          </div>
        ) : (
          <span className="text-gray-500">
            Kéo và thả ảnh vào đây hoặc
            <input
              type="file"
              id="image"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <label
              htmlFor="image"
              className="text-white hover:text-gray hover:bg-white rounded-md bg-gray cursor-pointer ml-2 py-2 px-2"
            >
              chọn ảnh
            </label>
          </span>
        )}
        {errorMessage && (
          <p className="text-red-500 text-xs mt-2">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;