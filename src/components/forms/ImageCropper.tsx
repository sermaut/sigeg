import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crop, Check, X, ZoomIn, ZoomOut } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface ImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
}

export function ImageCropper({ open, onOpenChange, imageSrc, onCrop }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  const [cropArea, setCropArea] = useState({
    x: 150,
    y: 150,
    size: 180
  });
  const [isDragging, setIsDragging] = useState(false);

  // Update preview whenever crop area changes
  useEffect(() => {
    if (!previewCanvasRef.current) return;
    
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const previewSize = 120;
      canvas.width = previewSize;
      canvas.height = previewSize;

      const scaleX = img.width / 300;
      const scaleY = img.height / 300;

      // Clear and draw with circular clip
      ctx.clearRect(0, 0, previewSize, previewSize);
      ctx.save();
      ctx.beginPath();
      ctx.arc(previewSize / 2, previewSize / 2, previewSize / 2, 0, Math.PI * 2);
      ctx.clip();
      
      ctx.drawImage(
        img,
        (cropArea.x - cropArea.size/2) * scaleX,
        (cropArea.y - cropArea.size/2) * scaleY,
        cropArea.size * scaleX,
        cropArea.size * scaleY,
        0,
        0,
        previewSize,
        previewSize
      );
      ctx.restore();
    };
    img.src = imageSrc;
  }, [imageSrc, cropArea]);

  const handleCrop = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const outputSize = 400;
      canvas.width = outputSize;
      canvas.height = outputSize;

      const scaleX = img.width / 300;
      const scaleY = img.height / 300;

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

      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => {
            onCrop(reader.result as string);
            onOpenChange(false);
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/webp', 0.85);
    };
    img.src = imageSrc;
  }, [imageSrc, cropArea, onCrop, onOpenChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const rect = imageContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const startX = e.clientX - rect.left - cropArea.x;
    const startY = e.clientY - rect.top - cropArea.y;

    const handlePointerMove = (e: PointerEvent) => {
      const newX = Math.max(cropArea.size/2, Math.min(300 - cropArea.size/2, e.clientX - rect.left - startX));
      const newY = Math.max(cropArea.size/2, Math.min(300 - cropArea.size/2, e.clientY - rect.top - startY));
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handleSizeChange = (value: number[]) => {
    const newSize = value[0];
    setCropArea(prev => ({ 
      ...prev, 
      size: newSize,
      x: Math.max(newSize/2, Math.min(300 - newSize/2, prev.x)),
      y: Math.max(newSize/2, Math.min(300 - newSize/2, prev.y))
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="w-5 h-5" />
            Recortar Imagem de Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
            {/* Image Preview with Crop Area */}
            <div className="space-y-4">
              <div 
                ref={imageContainerRef}
                className="relative mx-auto bg-muted rounded-lg overflow-hidden shadow-inner"
                style={{ width: '300px', height: '300px', touchAction: 'none' }}
              >
                {/* Dark overlay for non-selected areas */}
                <div className="absolute inset-0 pointer-events-none">
                  <svg width="300" height="300" className="absolute inset-0">
                    <defs>
                      <mask id="crop-mask">
                        <rect width="300" height="300" fill="white" />
                        <circle 
                          cx={cropArea.x} 
                          cy={cropArea.y} 
                          r={cropArea.size/2} 
                          fill="black"
                        />
                      </mask>
                    </defs>
                    <rect 
                      width="300" 
                      height="300" 
                      fill="rgba(0,0,0,0.6)" 
                      mask="url(#crop-mask)"
                    />
                  </svg>
                </div>
                
                <img
                  src={imageSrc}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                
                {/* Crop Circle */}
                <div
                  className={`absolute border-3 border-primary rounded-full cursor-move select-none transition-shadow ${
                    isDragging ? 'shadow-lg ring-4 ring-primary/30' : 'shadow-md'
                  }`}
                  style={{
                    left: `${cropArea.x}px`,
                    top: `${cropArea.y}px`,
                    width: `${cropArea.size}px`,
                    height: `${cropArea.size}px`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: isDragging ? '0 0 0 2px rgba(var(--primary), 0.3)' : 'none'
                  }}
                  onPointerDown={handlePointerDown}
                >
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-primary-foreground bg-primary/80 rounded-full p-2 text-xs font-medium backdrop-blur-sm">
                      Arrastar
                    </div>
                  </div>
                </div>
              </div>

              {/* Size Control */}
              <div className="space-y-3 px-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ZoomOut className="w-4 h-4" />
                    Tamanho do recorte
                  </label>
                  <ZoomIn className="w-4 h-4" />
                </div>
                <Slider
                  value={[cropArea.size]}
                  onValueChange={handleSizeChange}
                  min={100}
                  max={250}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col items-center gap-3 bg-muted/30 rounded-lg p-4 border">
              <span className="text-sm font-medium text-muted-foreground">Preview</span>
              <div className="relative">
                <canvas 
                  ref={previewCanvasRef}
                  className="rounded-full border-2 border-border shadow-lg"
                  width={120}
                  height={120}
                />
              </div>
              <span className="text-xs text-muted-foreground">400x400px</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
              size="lg"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleCrop} 
              className="flex-1"
              size="lg"
            >
              <Check className="w-4 h-4 mr-2" />
              Aplicar Recorte
            </Button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}