import { React, useState , useEffect } from 'react';

const AddActivity = ({ submitActivity, onClose, formTitle, submitTitle , initialValues }) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [imageUrl, setImageUrl] = useState(initialValues ? initialValues.image : '');

    useEffect(() => {
        if (initialValues) {
            setTitle(initialValues.title);
            setUrl(initialValues.link);
            setImageUrl(initialValues.image);
        }
    }, [initialValues]);

    const handleImageUrlChange = (e) => {
        setImageUrl(e.target.value);
    };

    const handleSubmit = () => {
        submitActivity({ title, url, imageUrl });
        setTitle('');
        setUrl('');
        setImageUrl(null);
        onClose();
    };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-secondary bg-opacity-50 z-50"> 
        <div className="bg-primary text-ascent-1 p-8 rounded-md w-[35%]">
            <div className="flex items-center border-b mr-3 text-xl text-ascent-1 pb-2 border-[#66666645] justify-between w-full mb-3">
                <span className="font-bold">{formTitle}</span> 
                <div className="flex items-center">
                    <button
                        onClick={onClose}
                        className="bg-red hover:bg-white text-white hover:text-red font-bold py-2 px-4 mr-0 rounded focus:outline-none focus:shadow-outline" // Thêm class cho nút Tắt
                    >
                        X
                    </button>
                </div>
            </div>

            <div className="mb-4 overflow-y-auto h-[calc(70vh-8rem)]">
                <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Tiêu đề:</label>
                <input
                    type="text"
                    id="title"
                    className="shadow bg-secondary appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <label htmlFor="url" className="block text-gray-700 font-bold mb-2 mt-4">URL:</label>
                    <input
                        type="text"
                        id="url"
                        className="shadow bg-secondary appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />

                <label htmlFor="imageUrl" className="block text-gray-700 font-bold mb-2 mt-4">Link hình ảnh:</label>
                <input
                    type="text"
                    id="imageUrl"
                    className="shadow bg-secondary appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                />

                {imageUrl && (
                    <div className="mt-4">
                        <img src={imageUrl} alt="Preview" className="max-w-full h-auto" />
                    </div>
                )}
                
            </div>
            <div className="flex justify-end mt-5">
            <button
                onClick={handleSubmit}
                className="bg-blue hover:bg-sky text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
                {submitTitle}
            </button>
            </div>
        </div>
    </div>
  );
};

export default AddActivity;