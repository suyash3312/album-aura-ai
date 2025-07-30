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
  const [classifier, setClassifier] = useState<any>(null);

  const initializeClassifier = useCallback(async () => {
    if (classifier) return classifier;
    
    try {
      console.log('Initializing image classification model...');
      const newClassifier = await pipeline(
        'image-classification',
        'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
        { device: 'webgpu' }
      );
      setClassifier(newClassifier);
      return newClassifier;
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU:', error);
      // Fallback to CPU if WebGPU is not available
      const newClassifier = await pipeline(
        'image-classification',
        'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k'
      );
      setClassifier(newClassifier);
      return newClassifier;
    }
  }, [classifier]);

  const classifyImage = useCallback(async (file: File): Promise<ClassificationResult[]> => {
    setIsLoading(true);
    try {
      const model = await initializeClassifier();
      
      // Convert file to image element
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      // Classify the image using the image element
      const results = await model(img);
      
      // Clean up
      URL.revokeObjectURL(imageUrl);
      
      // Return top 3 results
      return results.slice(0, 3).map((result: any) => ({
        label: result.label,
        score: result.score
      }));
    } catch (error) {
      console.error('Error classifying image:', error);
      // Return a fallback classification
      return [{ label: 'unknown', score: 0.5 }];
    } finally {
      setIsLoading(false);
    }
  }, [initializeClassifier]);

  return {
    classifyImage,
    isLoading
  };
};