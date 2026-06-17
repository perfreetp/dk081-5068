import { useState, useRef } from 'react';
import { Upload as UploadIcon, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';

interface UploadProps {
  maxFiles?: number;
  maxSize?: number;
  onChange?: (files: File[]) => void;
  initialImages?: string[];
}

export function Upload({ maxFiles = 9, maxSize = 5 * 1024 * 1024, onChange, initialImages = [] }: UploadProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > maxSize) return false;
      return true;
    });

    if (images.length + validFiles.length > maxFiles) {
      alert(`最多只能上传 ${maxFiles} 张图片`);
      return;
    }

    const newImages = validFiles.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages]);
    setFiles(prev => [...prev, ...validFiles]);
    onChange?.([...files, ...validFiles]);
  };

  const handleRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setFiles(prev => prev.filter((_, i) => i !== index));
    onChange?.(files.filter((_, i) => i !== index));
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative w-24 h-24 border border-gray-200 overflow-hidden">
            <img src={image} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
        {images.length < maxFiles && (
          <button
            onClick={handleClick}
            className="w-24 h-24 border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <UploadIcon className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-500">上传图片</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="text-xs text-gray-500">
        支持 JPG、PNG 格式，单张不超过 5MB，最多 {maxFiles} 张
      </div>
    </div>
  );
}

interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange?: (file: File | null) => void;
}

export function ImageUpload({ label, value, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onChange?.(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange?.(null);
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative w-20 h-20 border border-gray-200 overflow-hidden">
            <img src={preview} alt="" className="w-full h-full object-cover" />
            <button
              onClick={handleRemove}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 hover:bg-black/70 flex items-center justify-center"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 border-2 border-dashed border-gray-300 hover:border-primary-500 flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-500">上传</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
