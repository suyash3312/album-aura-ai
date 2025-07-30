import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Grid, Tag } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const formatCategoryName = (category: string) => {
    return category.split(',')[0].trim();
  };

  const getCategoryCount = (category: string) => {
    // This would typically come from props, but for now we'll simulate it
    return Math.floor(Math.random() * 10) + 1;
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange('all')}
            className={selectedCategory === 'all' 
              ? 'bg-gradient-primary hover:opacity-90' 
              : 'hover:bg-secondary/50'
            }
          >
            <Grid className="h-3 w-3 mr-1" />
            All Photos
          </Button>
          
          {categories.map((category) => {
            const displayName = formatCategoryName(category);
            const isSelected = selectedCategory === category;
            
            return (
              <Button
                key={category}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange(category)}
                className={isSelected 
                  ? 'bg-gradient-primary hover:opacity-90' 
                  : 'hover:bg-secondary/50'
                }
              >
                <Tag className="h-3 w-3 mr-1" />
                {displayName}
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-4 text-xs bg-background/20"
                >
                  {getCategoryCount(category)}
                </Badge>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};