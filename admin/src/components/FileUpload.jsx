import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUpload = ({ onFilesSelected }) => {
    const [files, setFiles] = useState([]);

    const onDrop = useCallback((acceptedFiles) => {
        const newFiles = acceptedFiles.map((file) => ({
            name: file.name,
            path: file.path,
        }));

        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        onFilesSelected([...files, ...newFiles]);
    }, [files, onFilesSelected]);

    const {
        getRootProps,
        getInputProps,
    } = useDropzone({
        onDrop,
        accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt',
        maxFiles: 5,
    });


    const handleRemoveFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));

        onFilesSelected(files.filter((_, i) => i !== index));

        URL.revokeObjectURL(files[index].path);
    }

    return (
        <div className="p-6 rounded-lg shadow-md bg-bgColor">
            <div
                {...getRootProps({
                    className: 'w-full p-4 border-2 border-dashed border-primary rounded-lg text-center cursor-pointer'
                })}
            >
                <input {...getInputProps()} />
                <p className="text-white">Kéo và thả file vào đây hoặc nhấp để chọn</p>
                <span className="mt-2 text-sm text-white">Tệp hỗ trợ: PDF, DOC, XLS</span>
            </div>

            <ul className="mt-4 space-y-2">
                {files.map((file, index) => (
                    <li key={index} className="relative flex items-center justify-between p-2 bg-white rounded-lg shadow-md">
                        <span className="text-primary">{file.name}</span>
                        <button
                            onClick={() => handleRemoveFile(index)}
                            className="p-1 text-white transition rounded-full bg-red hover:bg-secondary"
                        >
                            X
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileUpload;
