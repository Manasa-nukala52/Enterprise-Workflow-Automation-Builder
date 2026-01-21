import React, { useState } from 'react';
import { Upload, X, File, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const FileUploader = ({ instanceId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        if (e) e.preventDefault();
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        console.log("Full API BaseURL:", api.defaults.baseURL);
        console.log("Request Path:", `/files/upload/${instanceId}`);

        try {
            await api.post(`/files/upload/${instanceId}`, formData, {
                headers: {
                    'Content-Type': undefined // Let browser set multipart/form-data with boundary
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 4000);
            onUploadSuccess();
            setFile(null);
            setProgress(0);
        } catch (error) {
            console.error("Upload failed", error);
            const errorMsg = error.response?.data?.message || "File upload failed";
            alert(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className={`border-2 border-dashed rounded-xl p-6 transition-colors ${file ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700'}`}>
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer space-y-2"
                >
                    {file ? (
                        <div className="flex items-center gap-2 text-blue-400">
                            <File size={24} />
                            <span className="font-medium">{file.name}</span>
                        </div>
                    ) : (
                        <>
                            <Upload className="text-slate-500" size={32} />
                            <div className="text-center">
                                <span className="text-blue-500 font-medium">Click to upload</span>
                                <span className="text-slate-500"> or drag and drop</span>
                            </div>
                            <p className="text-xs text-slate-600">PDF, PNG, JPG (max 10MB)</p>
                        </>
                    )}
                </label>
            </div>

            {file && !uploading && (
                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-400">
                            <File size={20} className="animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold truncate max-w-[200px]">{file.name}</span>
                                <span className="text-[10px] opacity-70">Ready to be sent</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="p-1.5 hover:bg-slate-800 rounded-full text-slate-500 hover:text-rose-400 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleUpload}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
                    >
                        <Upload size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                        Finalize & Upload This Document
                    </button>
                    <p className="text-[10px] text-center text-slate-500 italic">Don't forget to click the button above to save your file!</p>
                </div>
            )}

            {uploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {uploadSuccess && (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 p-3 rounded-lg animate-in zoom-in duration-300">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-medium">File uploaded successfully!</span>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
