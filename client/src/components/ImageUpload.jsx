import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'

const ImageUpload = ({ onImagesSelected }) => {
    const [previews, setPreviews] = useState([]);

    const onDrop = useCallback((acceptedFiles) => {
        const newPreviews = acceptedFiles.map(file => {
            return Object.assign(file, {
                preview: URL.createObjectURL(file)
            });
        });

        setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
        onImagesSelected([...previews, ...newPreviews]);
    }, [previews, onImagesSelected]);



    useEffect(() => {
        return () => {
            previews.forEach((file) => URL.revokeObjectURL(file.preview));
        };
    }, [previews]);


    const {
        getRootProps,
        getInputProps,
    } = useDropzone({
        onDrop,
        accept: 'image/*',
        maxFiles: 5,
    })

    const handleRemoveImage = (index) => {
        setPreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));

        onImagesSelected(previews.filter((_, i) => i !== index));

        URL.revokeObjectURL(previews[index].preview);
    };


    return (
        <div className="p-6 rounded-lg shadow-md bg-bgColor">
            <div
                {...getRootProps({
                    className: 'w-full p-4 border-2 border-dashed border-primary rounded-lg text-center cursor-pointer'
                })}
            >
                <input {...getInputProps()} />
                <p className="text-white">Kéo và thả ảnh vào đây hoặc nhấp để chọn (tối đa 5 hình)</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                {previews.map((file, index) => (
                    <div key={index} className="relative">
                        <img
                            src={file.preview}
                            alt="preview"
                            className="object-cover w-full h-32 rounded-lg"
                        />
                        <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute p-1 text-white transition rounded-full top-1 right-1 bg-red hover:bg-secondary"
                        >
                            X
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ImageUpload