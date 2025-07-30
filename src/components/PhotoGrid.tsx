import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Calendar, Tag, TrendingUp } from 'lucide-react';
import { Photo } from './PhotoGallery';

interface PhotoGridProps {
  photos: Photo[];
  onDeletePhoto: (photoId: string) => void;
}

export const PhotoGrid = ({ photos, onDeletePhoto }: PhotoGridProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (confidence >= 0.6) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {photos.map((photo) => (
        <Dialog key={photo.id}>
          <DialogTrigger asChild>
            <Card className="group cursor-pointer overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-300 hover:scale-105 hover:shadow-glow">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 left-2 right-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                  <div className="flex flex-wrap gap-1">
                    {photo.categories.slice(0, 2).map((category, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
                        {category.split(',')[0]}
                      </Badge>
                    ))}
                    {photo.categories.length > 2 && (
                      <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
                        +{photo.categories.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-medium text-sm truncate">{photo.name}</h3>
                <div className="flex items-center justify-between">
                  <Badge 
                    className={`text-xs ${getConfidenceColor(photo.confidence)}`}
                    variant="outline"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {Math.round(photo.confidence * 100)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(photo.uploadedAt).split(',')[0]}
                  </span>
                </div>
              </div>
            </Card>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] bg-background/95 backdrop-blur-sm border-border/50">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <img
                  src={photo.src}
                  alt={photo.name}
                  className="w-full rounded-lg shadow-card"
                />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{photo.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(photo.uploadedAt)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="font-medium">AI Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {photo.categories.map((category, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="bg-secondary/50 hover:bg-secondary/70 transition-colors"
                      >
                        {category.split(',')[0]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-medium">Confidence Score</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AI Confidence</span>
                      <span className="font-medium">{Math.round(photo.confidence * 100)}%</span>
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${photo.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="w-full"
                    onClick={() => onDeletePhoto(photo.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Photo
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};