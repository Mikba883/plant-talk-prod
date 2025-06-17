
import React, { useState } from 'react';
import PlantTalkHeader from '@/components/PlantTalkHeader';
import CameraCapture from '@/components/CameraCapture';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Globe, ChevronDown } from 'lucide-react';
import { mockPlants } from '@/data/mockPlants';
import { useToast } from '@/hooks/use-toast';
import PremiumOffer from '@/components/PremiumOffer';

const Index = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [plantResult, setPlantResult] = useState<typeof mockPlants[0] | null>(null);
  const { toast } = useToast();

  const handleImageCapture = (imageData: string) => {
    setImage(imageData);
    analyzePlant(imageData);
  };

  const analyzePlant = (imageData: string) => {
    setIsAnalyzing(true);
    setPlantResult(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Randomly select a plant from our mock data
      const randomIndex = Math.floor(Math.random() * mockPlants.length);
      const result = mockPlants[randomIndex];
      
      setPlantResult(result);
      setIsAnalyzing(false);
      
      toast({
        title: `Identified: ${result.name}`,
        description: "Your plant is ready to talk to you!",
      });
    }, 3000);
  };

  const handleRestart = () => {
    setImage(null);
    setPlantResult(null);
  };

  const handleLanguageClick = () => {
    toast({
      title: "Language Selection",
      description: "Currently only English is available. More languages coming soon!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Language selector */}
      <div className="absolute top-4 right-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center gap-1"
          onClick={handleLanguageClick}
        >
          <Globe className="h-3 w-3" />
          EN
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="container px-4 py-8 flex flex-col items-center">
        <PlantTalkHeader />
        
        <div className="w-full max-w-md">
          {!plantResult ? (
            <CameraCapture onImageCapture={handleImageCapture} isLoading={isAnalyzing} showPreview={true} />
          ) : (
            <>
              {/* Plant Result Component is not available, show simple results */}
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-bold text-xl mb-2">{plantResult.name}</h3>
                <p className="text-gray-600">{plantResult.message}</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleRestart}
                className="mt-4 text-sm mx-auto block"
              >
                Take another photo
              </Button>
            </>
          )}
          
          {/* Show premium offer if plant was identified */}
          {plantResult && (
            <div className="mt-4">
              <PremiumOffer 
                isOpen={false}
                onClose={() => {}}
                onConfirm={() => {}}
              />
            </div>
          )}
        </div>
        
        <Separator className="my-8 max-w-md" />
        
        <div className="max-w-md text-center text-sm text-muted-foreground">
          <h4 className="font-medium mb-2">🌍 How PlantTalk Works</h4>
          <p className="mb-4">PlantTalk uses advanced AI to identify your plants and their health conditions, 
            then generates personalized voice messages to help you understand what they need.</p>
          
          <div className="grid grid-cols-3 gap-2 mt-6 text-xs">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-plant-light-green/20 flex items-center justify-center mb-2">
                <span className="text-plant-dark-green">1</span>
              </div>
              <span>Take a photo</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-plant-light-green/20 flex items-center justify-center mb-2">
                <span className="text-plant-dark-green">2</span>
              </div>
              <span>AI identifies plant</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-plant-light-green/20 flex items-center justify-center mb-2">
                <span className="text-plant-dark-green">3</span>
              </div>
              <span>Hear what it needs</span>
            </div>
          </div>
        </div>
        
        <footer className="mt-10 text-xs text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} PlantTalk. All rights reserved.</p>
          <p className="mt-1">Built with love for plants and their caretakers</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
