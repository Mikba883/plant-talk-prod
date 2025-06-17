
import React from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Bug, Droplet, Thermometer, Sun, Wind, Flower } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { conditionMap, HealthConditionCard } from '@/utils/plant-health-cards';

// Define the structure for health issues
interface HealthIssue {
  title: string;
  image?: string;
  symptoms: string;
  treatment: string[];
  severity: 'low' | 'medium' | 'high';
  icon?: string;
}

interface PlantHealthGalleryProps {
  plantData?: any;
}

const PlantHealthGallery: React.FC<PlantHealthGalleryProps> = ({ plantData }) => {
  // Function to match health condition to our mappings
  const matchCondition = (condition: string): HealthConditionCard | null => {
    const lowerCondition = condition.toLowerCase();
    
    // Try direct match with conditionMap
    if (conditionMap[lowerCondition]) {
      return conditionMap[lowerCondition];
    }
    
    // Try matching by ID
    for (const mapping of Object.values(conditionMap)) {
      if (lowerCondition === mapping.id) {
        return mapping;
      }
    }
    
    // Try keywords match
    for (const mapping of Object.values(conditionMap)) {
      if (mapping.keywords && mapping.keywords.some(keyword => lowerCondition.includes(keyword))) {
        return mapping;
      }
    }
    
    // Try partial matches in title or description
    for (const mapping of Object.values(conditionMap)) {
      if (lowerCondition.includes(mapping.id) || 
          mapping.title.toLowerCase().includes(lowerCondition) ||
          (mapping.description && mapping.description.toLowerCase().includes(lowerCondition))) {
        return mapping;
      }
    }
    
    return null;
  };

  // Process plant data to extract health issues
  const extractHealthIssues = (): HealthIssue[] => {
    const issues: HealthIssue[] = [];
    const REQUIRED_CARDS = 3; // Always show exactly 3 cards
    const MIN_PROBABILITY = 0.0; // Allow all probabilities to be considered
    
    // Track used condition IDs to avoid duplicates
    const usedConditionIds = new Set<string>();
    
    // If we have raw health assessment data from API with health_predictions
    if (plantData?.health_assessment?.health_predictions && Array.isArray(plantData.health_assessment.health_predictions)) {
      const predictions = plantData.health_assessment.health_predictions;
      
      // Sort predictions by probability in descending order
      const sortedPredictions = [...predictions].sort((a, b) => 
        (b.probability || 0) - (a.probability || 0)
      );
      
      // Filter predictions by probability threshold and match with conditionMap
      for (const prediction of sortedPredictions) {
        if (issues.length >= REQUIRED_CARDS) break;
        
        if (prediction.probability > MIN_PROBABILITY) {
          const name = prediction.name || "Unknown Issue";
          const matchedCondition = matchCondition(name);
          
          if (matchedCondition && !usedConditionIds.has(matchedCondition.id)) {
            usedConditionIds.add(matchedCondition.id);
            
            issues.push({
              title: matchedCondition.title,
              symptoms: matchedCondition.description,
              treatment: prediction.treatment?.steps || matchedCondition.treatment,
              severity: matchedCondition.severity || getSeverityFromProbability(prediction.probability),
              image: prediction.image || matchedCondition.image || "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300&h=200",
              icon: matchedCondition.icon
            });
          }
        }
      }
    }
    
    // If we couldn't find enough matching conditions, fill with random ones from conditionMap
    if (issues.length < REQUIRED_CARDS) {
      const availableConditions = Object.values(conditionMap)
        .filter(condition => !usedConditionIds.has(condition.id));
      
      // Shuffle the available conditions for true randomness
      const shuffledConditions = [...availableConditions].sort(() => Math.random() - 0.5);
      
      for (const condition of shuffledConditions) {
        if (issues.length >= REQUIRED_CARDS) break;
        
        if (!usedConditionIds.has(condition.id)) {
          usedConditionIds.add(condition.id);
          
          issues.push({
            title: condition.title,
            symptoms: condition.description,
            treatment: condition.treatment,
            severity: condition.severity,
            image: condition.image,
            icon: condition.icon
          });
        }
      }
    }
    
    return issues;
  };

  // Convert probability to severity level
  const getSeverityFromProbability = (probability?: number): 'low' | 'medium' | 'high' => {
    if (probability === undefined) return 'medium';
    if (probability < 0.3) return 'low';
    if (probability < 0.7) return 'medium';
    return 'high';
  };

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get the appropriate icon for each health issue
  const getIssueIcon = (issue: any) => {
    // If the issue has an icon from our condition map, use it
    if (issue.icon) {
      return <span className="text-lg">{issue.icon}</span>;
    }
    
    // Fallback to Lucide icons based on title
    const titleLower = issue.title.toLowerCase();
    
    if (titleLower.includes('pest') || titleLower.includes('insect') || titleLower.includes('bug') || 
        titleLower.includes('mite') || titleLower.includes('bug')) {
      return <Bug className="h-5 w-5" />;
    }
    if (titleLower.includes('water') || titleLower.includes('overwater') || titleLower.includes('root rot') || 
        titleLower.includes('moist') || titleLower.includes('humid')) {
      return <Droplet className="h-5 w-5" />;
    }
    if (titleLower.includes('temp') || titleLower.includes('cold') || titleLower.includes('hot') || 
        titleLower.includes('frost') || titleLower.includes('burn')) {
      return <Thermometer className="h-5 w-5" />;
    }
    if (titleLower.includes('sun') || titleLower.includes('light') || titleLower.includes('burn') || 
        titleLower.includes('yellow') || titleLower.includes('pale')) {
      return <Sun className="h-5 w-5" />;
    }
    if (titleLower.includes('fungus') || titleLower.includes('mildew') || titleLower.includes('mold')) {
      return <Wind className="h-5 w-5" />;
    }
    if (titleLower.includes('flower') || titleLower.includes('bloom') || titleLower.includes('bud')) {
      return <Flower className="h-5 w-5" />;
    }
    
    // Default icon
    return <Leaf className="h-5 w-5" />;
  };

  // Get the health issues from the plant data
  const healthIssues = extractHealthIssues();

  return (
    <div className="my-6">
      <h3 className="font-semibold text-lg text-plant-dark-green mb-3">What's Wrong With Me?</h3>
      <Carousel className="w-full">
        <CarouselContent>
          {healthIssues.map((issue, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <Card className="border-plant-dark-green/10">
                <div className="relative h-[150px] overflow-hidden rounded-t-lg">
                  <img 
                    src={issue.image || `https://images.unsplash.com/photo-${1518495973542 + index}-4542c06a5843?auto=format&fit=crop&w=300&h=200`}
                    alt={issue.title} 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={getSeverityColor(issue.severity)}>
                      {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h4 className="font-medium text-plant-dark-green flex items-center gap-2">
                          <span className="bg-muted rounded-full p-1.5 flex">
                            {getIssueIcon(issue)}
                          </span>
                          {issue.title}
                        </h4>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{issue.symptoms}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">{issue.symptoms}</p>
                  <div className="bg-muted/20 p-2 rounded-md text-xs">
                    <strong>Treatment:</strong>
                    <ul className="list-disc ml-4 mt-1 space-y-1">
                      {issue.treatment.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
};

export default PlantHealthGallery;
