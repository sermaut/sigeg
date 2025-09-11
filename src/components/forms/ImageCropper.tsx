import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crop, RotateCcw, Check, X } from "lucide-react";

interface ImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
}

export function ImageCropper({ open, onOpenChange, imageSrc, onCrop }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cropArea, setCropArea] = useState({
    x: 50,
    y: 50,
    size: 200
  });

  const handleCrop = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to 400x400 for high quality output
      const outputSize = 400;
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Calculate scale based on preview dimensions
      const previewWidth = 300;
      const previewHeight = 300;
      const scaleX = img.width / previewWidth;
      const scaleY = img.height / previewHeight;

      // Draw cropped image scaled to full canvas size
      ctx.drawImage(
        img,
        (cropArea.x - cropArea.size/2) * scaleX,
        (cropArea.y - cropArea.size/2) * scaleY,
        cropArea.size * scaleX,
        cropArea.size * scaleY,
        0,
        0,
        outputSize,
        outputSize
      );

      // Convert to blob and callback
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => {
            onCrop(reader.result as string);
            onOpenChange(false);
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/jpeg', 0.95);
    };
    img.src = imageSrc;
  }, [imageSrc, cropArea, onCrop, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="w-4 h-4" />
            Recortar Imagem
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Preview with Crop Area */}
          <div className="relative mx-auto" style={{ width: '300px', height: '300px' }}>
            <img
              src={imageSrc}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <div
              className="absolute border-2 border-blue-500 bg-blue-500/20 rounded-full cursor-move select-none"
              style={{
                left: `${cropArea.x}px`,
                top: `${cropArea.y}px`,
                width: `${cropArea.size}px`,
                height: `${cropArea.size}px`,
                transform: 'translate(-50%, -50%)'
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                const startX = e.clientX - rect.left - cropArea.x;
                const startY = e.clientY - rect.top - cropArea.y;

                const handleMouseMove = (e: MouseEvent) => {
                  const parentRect = e.currentTarget ? (e.currentTarget as HTMLElement).getBoundingClientRect() : rect;
                  const newX = Math.max(cropArea.size/2, Math.min(300 - cropArea.size/2, e.clientX - rect.left - startX));
                  const newY = Math.max(cropArea.size/2, Math.min(300 - cropArea.size/2, e.clientY - rect.top - startY));
                  setCropArea(prev => ({ ...prev, x: newX, y: newY }));
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          </div>

          {/* Size Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tamanho do recorte</label>
            <input
              type="range"
              min="100"
              max="250"
              value={cropArea.size}
              onChange={(e) => setCropArea(prev => ({ 
                ...prev, 
                size: parseInt(e.target.value),
                x: Math.max(parseInt(e.target.value)/2, Math.min(300 - parseInt(e.target.value)/2, prev.x)),
                y: Math.max(parseInt(e.target.value)/2, Math.min(300 - parseInt(e.target.value)/2, prev.y))
              }))}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleCrop} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Recortar
            </Button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}