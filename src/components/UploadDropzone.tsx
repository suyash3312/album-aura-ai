import { useCallback, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

interface UploadDropzoneProps {
  onFilesDropped: (files: File[]) => void;
  isProcessing: boolean;
}

export const UploadDropzone = ({ onFilesDropped, isProcessing }: UploadDropzoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onFilesDropped(files);
      e.dataTransfer.clearData();
    }
  }, [onFilesDropped]);

  return (
    <Card
      className={`
        relative p-8 border-2 border-dashed transition-all duration-300 cursor-pointer
        ${isDragOver 
          ? 'border-primary bg-gradient-secondary scale-105 shadow-glow' 
          : 'border-border/50 hover:border-primary/50 hover:bg-secondary/20'
        }
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          {isProcessing ? (
            <Sparkles className="h-12 w-12 text-primary animate-spin" />
          ) : isDragOver ? (
            <div className="relative">
              <Upload className="h-12 w-12 text-primary animate-bounce" />
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            </div>
          ) : (
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {isProcessing ? 'Processing images...' : 
             isDragOver ? 'Drop files here!' : 
             'Drag & drop your photos'}
          </h3>
          <p className="text-muted-foreground">
            {isProcessing ? 'AI is analyzing your images' : 
             'Supports JPG, PNG, GIF, and WebP files'}
          </p>
        </div>

        {!isProcessing && (
          <div className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI-powered categorization included
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};