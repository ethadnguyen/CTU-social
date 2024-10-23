import React from 'react';
import { useLocation } from 'react-router-dom';

const ImageDetail = () => {
  const location = useLocation();
  const images = location.state?.images;

  return (
    <div className="image-container">
      {images?.length > 0 ? (
        images.map((img, index) => (
          <div key={index} className="relative">
            <img
              src={img}
              alt={`post image ${index}`}
              className='w-full mt-2 rounded-lg'
            />
          </div>
        ))
      ) : (
        <p>Không có hình ảnh nào.</p>
      )}
    </div>
  );
};

export default ImageDetail;