import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, Sparkles, Filter } from 'lucide-react';
import { PhotoGrid } from './PhotoGrid';
import { CategoryFilter } from './CategoryFilter';
import { UploadDropzone } from './UploadDropzone';
import { useImageClassification } from '@/hooks/useImageClassification';

export interface Photo {
  id: string;
  src: string;
  name: string;
  categories: string[];
  confidence: number;
  uploadedAt: Date;
}

export const PhotoGallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { classifyImage, isLoading: isClassifying } = useImageClassification();

  const handleDeletePhoto = useCallback((photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    toast({
      title: "Photo deleted",
      description: "The photo has been removed from your gallery",
    });
  }, [toast]);

  const handleFileUpload = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    const newPhotos: Photo[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        continue;
      }

      try {
        // Convert to base64 for storage
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Classify the image
        const classification = await classifyImage(file);
        
        const photo: Photo = {
          id: crypto.randomUUID(),
          src: base64,
          name: file.name,
          categories: classification.map(c => c.label),
          confidence: classification[0]?.score || 0,
          uploadedAt: new Date(),
        };

        newPhotos.push(photo);
        
        toast({
          title: "Photo categorized!",
          description: `${file.name} classified as: ${classification[0]?.label}`,
        });
      } catch (error) {
        console.error('Error processing file:', error);
        toast({
          title: "Error processing image",
          description: `Failed to process ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setPhotos(prev => [...prev, ...newPhotos]);
    setIsProcessing(false);
  }, [classifyImage, toast]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(photo => 
        photo.categories.some(cat => 
          cat.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      );

  const allCategories = Array.from(
    new Set(photos.flatMap(photo => photo.categories))
  ).sort();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-primary">
        <div className="absolute inset-0 bg-background/10 backdrop-blur-sm" />
        <div className="relative container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ImageIcon className="h-8 w-8 text-primary-foreground" />
              <Sparkles className="h-6 w-6 text-accent-foreground animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground">
              AI Photo Gallery
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Upload your photos and let AI automatically categorize them with intelligent image recognition
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Upload Section */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">Upload Photos</h2>
              {(isProcessing || isClassifying) && (
                <Badge variant="secondary" className="ml-auto">
                  <Sparkles className="h-3 w-3 mr-1 animate-spin" />
                  Processing...
                </Badge>
              )}
            </div>
            
            <UploadDropzone 
              onFilesDropped={handleFileUpload}
              isProcessing={isProcessing || isClassifying}
            />
            
            <div className="flex gap-4">
              <Button 
                onClick={handleUploadClick}
                disabled={isProcessing || isClassifying}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>
        </Card>

        {/* Categories and Gallery */}
        {photos.length > 0 && (
          <>
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Categories</h2>
                <Badge variant="outline" className="ml-auto">
                  {filteredPhotos.length} photos
                </Badge>
              </div>
              <CategoryFilter
                categories={allCategories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </Card>

            <PhotoGrid photos={filteredPhotos} onDeletePhoto={handleDeletePhoto} />
          </>
        )}

        {photos.length === 0 && !isProcessing && (
          <Card className="p-12 text-center bg-card/30 backdrop-blur-sm border-border/50">
            <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
            <p className="text-muted-foreground">
              Upload your first photos to get started with AI categorization
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};