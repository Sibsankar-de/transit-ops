"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Camera, ZoomIn, ZoomOut, Move } from "lucide-react";
import { cn } from "../utils";

interface AvatarUploadProps {
  value?: string; // base64 string
  onChange?: (value: string) => void;
  className?: string;
}

export function AvatarUpload({ value, onChange, className }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (value) {
      setPreview(value);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  // Dragging / Panning handlers inside crop circle
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.current.x,
      y: e.touches[0].clientY - dragStart.current.y,
    });
  };

  const handleSave = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      ctx.clearRect(0, 0, 200, 200);
      ctx.save();
      
      // Translate to center, apply scale, then position
      ctx.translate(100 + position.x, 100 + position.y);
      ctx.scale(zoom, zoom);
      
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const aspectRatio = imgWidth / imgHeight;
      
      let drawWidth = 200;
      let drawHeight = 200;
      
      if (aspectRatio > 1) {
        drawHeight = 200 / aspectRatio;
      } else {
        drawWidth = 200 * aspectRatio;
      }
      
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();
      
      const croppedImage = canvas.toDataURL("image/jpeg");
      setPreview(croppedImage);
      onChange?.(croppedImage);
      setModalOpen(false);
      
      // Clean up input value
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {/* Avatar Container */}
      <div
        onClick={triggerSelectFile}
        className="group relative w-32 h-32 rounded-full overflow-hidden border-2 border-border hover:border-primary bg-secondary cursor-pointer transition-all duration-200"
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground bg-secondary/80">
            M
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200">
          <Camera size={24} className="text-primary" />
          <span className="text-[10px] uppercase font-bold tracking-wider mt-1.5">
            Change Photo
          </span>
        </div>
      </div>

      {/* Crop Modal */}
      <Modal
        openState={modalOpen}
        onClose={() => setModalOpen(false)}
        header={
          <ModalHeader
            title="Crop Profile Image"
            subtitle="Drag to pan, slide to zoom"
          />
        }
        className="w-[95vw] max-w-[450px]"
      >
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Crop Container with Circular Overlay */}
          <div
            className="w-64 h-64 border border-border bg-black/30 rounded-xl relative overflow-hidden flex items-center justify-center cursor-move touch-none select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {/* The circular crop preview area */}
            <div className="absolute w-48 h-48 rounded-full border-2 border-primary/80 pointer-events-none z-10 shadow-[0_0_0_9999px_rgba(15,17,23,0.7)]" />
            
            {imageSrc && (
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Source"
                draggable={false}
                className="max-w-none max-h-none pointer-events-none object-contain w-48 h-48 select-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transition: isDragging ? "none" : "transform 0.1s ease-out",
                }}
              />
            )}

            {/* Helper icon overlay in center */}
            <div className="absolute bottom-2 right-2 text-white/40 pointer-events-none z-20">
              <Move size={16} />
            </div>
          </div>

          {/* Zoom controls slider */}
          <div className="w-full space-y-2 px-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ZoomOut size={14} />
                <span>Zoom</span>
              </div>
              <span className="font-mono">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-primary bg-secondary border border-border h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 w-full border-t border-border pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Apply & Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
