
import React from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wheat, Bug, AlertCircle } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';

interface Disease {
  name: string;
  probability: number;
  suggestions?: string[];
}

interface DiseaseCarouselProps {
  diseases: Disease[];
  isPremium: boolean;
}

const DiseaseCarousel: React.FC<DiseaseCarouselProps> = ({ diseases, isPremium }) => {
  console.log('🦠 [DiseaseCarousel] Diseases ricevute:', diseases);
  console.log('🦠 [DiseaseCarousel] isPremium:', isPremium);
  console.log('🦠 [DiseaseCarousel] Numero diseases:', diseases?.length || 0);
  
  const filteredDiseases = diseases || [];
  const isMobile = useIsMobile();
  
  if (filteredDiseases.length === 0) {
    console.log('🦠 [DiseaseCarousel] Nessuna malattia trovata');
    return null;
  }

  // Helper to get appropriate icon for disease
  const getDiseaseIcon = (diseaseName: string) => {
    const name = diseaseName.toLowerCase();
    if (name.includes('pest') || name.includes('insect')) {
      return <Bug className="h-6 w-6 text-orange-500" />;
    } else if (name.includes('fungus') || name.includes('mold') || name.includes('mildew')) {
      return <Wheat className="h-6 w-6 text-green-700" />;
    }
    return <AlertCircle className="h-6 w-6 text-yellow-500" />;
  };

  // Single disease card (full width, no carousel navigation)
  if (filteredDiseases.length === 1 && !isMobile) {
    const disease = filteredDiseases[0];
    console.log('🦠 [DiseaseCarousel] Rendering single disease:', disease);
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            {getDiseaseIcon(disease.name)}
            <CardTitle className="text-base">{disease.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            This issue may affect your plant's health and growth if not addressed.
          </p>
          {disease.suggestions && disease.suggestions.length > 0 && isPremium && (
            <div className="space-y-1">
              <p className="font-medium text-xs">Suggested treatments:</p>
              <ul className="text-xs list-disc pl-5 space-y-1">
                {disease.suggestions.map((suggestion, i) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          {!isPremium && (
            <p className="text-xs text-muted-foreground italic">
              Upgrade to Premium to see treatment suggestions
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Multiple diseases (or mobile), use carousel but hide arrows for 2 or fewer on desktop
  const showNavigation = isMobile || filteredDiseases.length > 2;
  console.log('🦠 [DiseaseCarousel] Rendering multiple diseases, showNavigation:', showNavigation);
  
  return (
    <Carousel
      opts={{ 
        align: "start",
        loop: filteredDiseases.length > 2
      }}
      className="w-full"
    >
      <CarouselContent>
        {filteredDiseases.map((disease, index) => (
          <CarouselItem key={index} className={isMobile ? "basis-full" : "basis-1/2"}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  {getDiseaseIcon(disease.name)}
                  <CardTitle className="text-base">{disease.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  This issue may affect your plant's health and growth if not addressed.
                </p>
                {disease.suggestions && disease.suggestions.length > 0 && isPremium && (
                  <div className="space-y-1">
                    <p className="font-medium text-xs">Suggested treatments:</p>
                    <ul className="text-xs list-disc pl-5 space-y-1">
                      {disease.suggestions.map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!isPremium && (
                  <p className="text-xs text-muted-foreground italic">
                    Upgrade to Premium to see treatment suggestions
                  </p>
                )}
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      {showNavigation && (
        <div className="flex justify-end gap-2 mt-2">
          <CarouselPrevious className="relative static translate-y-0 left-0" />
          <CarouselNext className="relative static translate-y-0 right-0" />
        </div>
      )}
    </Carousel>
  );
};

export default DiseaseCarousel;
