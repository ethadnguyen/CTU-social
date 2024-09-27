import React from 'react';
import { useSelector } from 'react-redux';
//import { MdClose } from 'react-icons/md';

const ImageDetail = ({ images, onClose }) => {
    const { theme } = useSelector((state) => state.theme);

    return (
    <div className="fixed z-50 inset-0 overflow-y-auto" onClick={onClose}>
        <div className="flex items-center justify-center min-h-screen">
            <div className={`bg-${theme === 'dark' ? 'black' : 'white'} shadow-xl rounded-lg p-4 w-full max-w-[95%] max-h-[80%]`}>
                {images.map((img, index) => (
                    <img
                        onClick={onClose}
                        key={index} 
                        src={img} 
                        alt={`post image ${index}`} 
                        className="w-full h-auto mt-3" 
                    />
                ))}
            </div>
        </div>
    </div>
    );
};

export default ImageDetail;
