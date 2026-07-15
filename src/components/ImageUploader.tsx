import React, { useState, useRef } from 'react';
import { Upload, ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  label?: string;
  id?: string;
}

export default function ImageUploader({
  value,
  onChange,
  addNotification,
  label = 'Product Image',
  id = 'product-image-uploader'
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addNotification('Invalid File Type', 'Please upload a valid image file (PNG, JPG, WEBP, GIF).', 'warning');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      addNotification('File Too Large', 'Maximum file size allowed is 5MB.', 'warning');
      return;
    }

    setIsUploading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        // Retrieve public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        onChange(publicUrl);
        addNotification('Upload Successful', 'Product image uploaded and saved in Supabase storage bucket successfully.', 'success');
      } catch (err: any) {
        console.error('[SUPABASE STORAGE UPLOAD ERROR]:', err);
        addNotification('Upload Failed', err.message || 'An error occurred while uploading file to Supabase.', 'error');
      } finally {
        setIsUploading(false);
      }
    } else {
      // Local simulated file reader base64 fallback
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
          addNotification('Local Upload Simulated', 'Image converted to local storage URL (Live Supabase offline/simulated).', 'info');
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('[LOCAL PREVIEW FILE READING FAILED]:', err);
        addNotification('Upload Failed', 'Failed to generate local preview from chosen file.', 'error');
        setIsUploading(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2" id={id}>
      <label className="block text-xs font-semibold text-slate-650">{label}</label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[140px] ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/50' 
            : isUploading 
              ? 'border-slate-300 bg-slate-50' 
              : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50/40'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-2 flex flex-col items-center animate-pulse">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs font-bold text-slate-600">Uploading to Storage...</p>
            <p className="text-[10px] text-slate-400 font-mono">Storing media asset securely</p>
          </div>
        ) : (
          <div className="space-y-2 flex flex-col items-center">
            {value ? (
              <div className="relative group/thumb">
                <img
                  src={value}
                  alt="Product Thumbnail Preview"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover shadow-sm border border-slate-200 group-hover/thumb:brightness-75 transition-all"
                />
                <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white p-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-slate-100 rounded-2xl text-slate-500">
                <Upload className="w-6 h-6 text-slate-450" />
              </div>
            )}
            
            <div className="text-xs">
              <span className="font-bold text-blue-600 hover:text-blue-700">Click to upload</span>
              <span className="text-slate-450"> or drag and drop</span>
            </div>
            
            <p className="text-[10px] text-slate-400">PNG, JPG, WEBP or GIF up to 5MB</p>
          </div>
        )}
      </div>

      {value && (
        <div className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <ImageIcon className="w-3.5 h-3.5 text-slate-450 shrink-0" />
          <input
            type="text"
            readOnly
            value={value}
            title={value}
            className="w-full text-[10px] text-slate-500 bg-transparent border-none outline-none font-mono truncate cursor-default select-all"
          />
        </div>
      )}
    </div>
  );
}
