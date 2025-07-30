import { useState, useCallback } from 'react';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowRemoteModels = true;
env.allowLocalModels = false;

interface ClassificationResult {
  label: string;
  score: number;
}

export const useImageClassification = () => {
  const [isLoading, setIsLoading] = useState(false);

  const classifyImage = useCallback(async (file: File): Promise<ClassificationResult[]> => {
    setIsLoading(true);
    try {
      console.log('Starting classification for:', file.name);
      
      // Create a fresh classifier for each image to avoid state issues
      let classifier;
      try {
        classifier = await pipeline(
          'image-classification',
          'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
          { device: 'webgpu' }
        );
      } catch (error) {
        console.warn('WebGPU failed, using CPU:', error);
        classifier = await pipeline(
          'image-classification',
          'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k'
        );
      }
      
      // Convert file to image URL
      const imageUrl = URL.createObjectURL(file);
      
      try {
        // Classify the image
        const results = await classifier(imageUrl);
        console.log('Classification results for', file.name, ':', results);
        
        // Return top 3 results
        return results.slice(0, 3).map((result: any) => ({
          label: result.label,
          score: result.score
        }));
      } finally {
        // Always clean up the URL
        URL.revokeObjectURL(imageUrl);
      }
    } catch (error) {
      console.error('Error classifying image:', file.name, error);
      // Return a fallback classification
      return [{ label: 'unknown', score: 0.5 }];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    classifyImage,
    isLoading
  };
};