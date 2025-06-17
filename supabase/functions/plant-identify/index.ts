
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to calculate health probability based on plant data
const calculateHealthProbability = (plantData: any): number => {
  let baseHealth = 0.85; // Base health for identified plants
  
  // Adjust based on confidence
  if (plantData.probability) {
    baseHealth = Math.min(0.95, baseHealth + (plantData.probability * 0.1));
  }
  
  // Reduce if diseases are detected
  if (plantData.diseases && plantData.diseases.length > 0) {
    const diseaseImpact = plantData.diseases.reduce((sum: number, disease: any) => 
      sum + (disease.probability || 0), 0) / plantData.diseases.length;
    baseHealth = Math.max(0.3, baseHealth - (diseaseImpact * 0.4));
  }
  
  return Number(baseHealth.toFixed(3));
};

// Helper function to generate care instructions
const generateCareInfo = (plantDetails: any, plantName: string) => {
  const defaultCare = {
    light: "Place me in bright, indirect light",
    water: "Water when top inch of soil feels dry",
    temperature: "Keep me in temperatures between 65-75°F (18-24°C)"
  };

  if (!plantDetails) return defaultCare;

  const care: any = { ...defaultCare };

  // Sunlight requirements
  if (plantDetails.sunlight && plantDetails.sunlight.length > 0) {
    const sunlight = plantDetails.sunlight[0].toLowerCase();
    if (sunlight.includes('full sun')) {
      care.light = "I love full direct sunlight for 6+ hours daily";
    } else if (sunlight.includes('partial')) {
      care.light = "I prefer bright, indirect light or partial sun";
    } else if (sunlight.includes('shade')) {
      care.light = "I thrive in low to medium light conditions";
    }
  }

  // Watering requirements
  if (plantDetails.watering) {
    const watering = plantDetails.watering;
    if (watering.min && watering.max) {
      care.water = `Water me every ${watering.min}-${watering.max} days, keeping soil lightly moist`;
    }
  }

  // Temperature preferences based on plant type
  const lowerName = plantName.toLowerCase();
  if (lowerName.includes('succulent') || lowerName.includes('cactus')) {
    care.temperature = "I prefer warm conditions, 70-80°F (21-27°C)";
  } else if (lowerName.includes('fern') || lowerName.includes('moss')) {
    care.temperature = "I like cool, humid conditions, 60-70°F (15-21°C)";
  }

  return care;
};

// Helper function to generate plant description
const generatePlantDescription = (plantDetails: any, plantName: string): string => {
  const baseName = plantName || 'your plant';
  
  if (plantDetails?.wiki_description?.value) {
    return plantDetails.wiki_description.value;
  }
  
  if (plantDetails?.description) {
    return plantDetails.description;
  }

  // Generate based on plant type
  const lowerName = baseName.toLowerCase();
  if (lowerName.includes('cactus') || lowerName.includes('succulent')) {
    return `I'm a hardy ${baseName} that stores water in my thick leaves or stems. I'm perfect for beginners and can tolerate some neglect. My waxy surfaces help me retain moisture in dry conditions.`;
  } else if (lowerName.includes('fern')) {
    return `I'm a beautiful ${baseName} with delicate, feathery fronds. I love humidity and filtered light, reminiscent of my natural forest floor habitat.`;
  } else if (lowerName.includes('orchid')) {
    return `I'm an elegant ${baseName} known for my stunning blooms. I'm an epiphyte in nature, meaning I grow on other plants, so I prefer well-draining bark-based soil.`;
  } else if (lowerName.includes('monstera') || lowerName.includes('philodendron')) {
    return `I'm a tropical ${baseName} with gorgeous fenestrated leaves. As I mature, my leaves develop more splits and holes, making me a stunning centerpiece plant.`;
  }
  
  return `I'm your lovely ${baseName}. I'm a wonderful addition to any home and I'll do my best to thrive with proper care and attention. 🌿`;
};

// Helper function to generate personalized message
const generatePersonalizedMessage = (plantData: any, healthProbability: number): string => {
  const plantName = plantData.common_names?.[0] || plantData.plant_name || plantData.name || 'plant friend';
  const confidence = Math.round((plantData.probability || 0.85) * 100);
  
  let healthMessage = "";
  if (healthProbability >= 0.9) {
    healthMessage = "I'm feeling fantastic and healthy! 🌟";
  } else if (healthProbability >= 0.75) {
    healthMessage = "I'm doing well overall, just keep an eye on me! 🌱";
  } else if (healthProbability >= 0.6) {
    healthMessage = "I'm a bit stressed and could use some extra care. 😐";
  } else {
    healthMessage = "I need your help! I'm not feeling my best right now. 🆘";
  }

  return `Hello! I'm your ${plantName} and I'm ${confidence}% confident that's who I am! ${healthMessage} Let me tell you about myself and how you can help me thrive in our home together. I'm excited to grow with you! 🌿✨`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🌱 [Plant-Identify] Enhanced function called');
    
    const { images } = await req.json();
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      console.error('🌱 [Plant-Identify] No images provided');
      return new Response(
        JSON.stringify({ error: 'No images provided' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const plantIdApiKey = Deno.env.get('PLANT_ID_API_KEY');
    if (!plantIdApiKey) {
      console.error('🌱 [Plant-Identify] PLANT_ID_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Plant.id API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🌱 [Plant-Identify] Calling Plant.id API...');

    // Enhanced request body for Plant.id API
    const requestBody = {
      images: images,
      modifiers: ["crops_fast", "similar_images", "health_all", "disease_similar_images"],
      plant_language: "en",
      plant_details: [
        "common_names",
        "url", 
        "name_authority",
        "wiki_description",
        "taxonomy",
        "synonyms",
        "edible_parts",
        "watering",
        "sunlight",
        "propagation_methods"
      ]
    };

    // Call Plant.id API with retry logic
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🌱 [Plant-Identify] Attempt ${attempt}/3 to Plant.id API`);
        
        const response = await fetch('https://api.plant.id/v2/identify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': plantIdApiKey
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`🌱 [Plant-Identify] Plant.id API error (${response.status}):`, errorText);
          lastError = new Error(`Plant.id API error: ${response.status} - ${errorText}`);
          
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          throw lastError;
        }

        const data = await response.json();
        console.log('🌱 [Plant-Identify] ✅ Plant.id API response received successfully');
        
        // Process and enhance the response
        if (data.result?.classification?.suggestions?.length > 0) {
          const topSuggestion = data.result.classification.suggestions[0];
          const plantDetails = topSuggestion.plant_details || topSuggestion.details;
          
          console.log(`🌱 [Plant-Identify] Processing: ${topSuggestion.plant_name || topSuggestion.name}`);
          
          // Calculate dynamic health probability
          const healthProbability = calculateHealthProbability({
            probability: topSuggestion.probability,
            diseases: data.result.disease?.suggestions || [],
            isHealthy: data.result.is_healthy
          });
          
          // Generate enhanced care information
          const careInfo = generateCareInfo(plantDetails, topSuggestion.plant_name || topSuggestion.name);
          
          // Generate rich description
          const description = generatePlantDescription(plantDetails, topSuggestion.plant_name || topSuggestion.name);
          
          // Generate personalized message
          const personalizedMessage = generatePersonalizedMessage(topSuggestion, healthProbability);
          
          // Enhance response with processed data
          const enhancedResponse = {
            ...data,
            processed: {
              healthProbability,
              careInfo,
              description,
              message: personalizedMessage,
              commonName: plantDetails?.common_names?.[0] || topSuggestion.plant_name || topSuggestion.name,
              scientificName: topSuggestion.name || 'Unknown Species',
              confidence: topSuggestion.probability || 0.85,
              wikipediaUrl: plantDetails?.url,
              wikiDescription: plantDetails?.wiki_description?.value,
              synonyms: plantDetails?.synonyms || [],
              taxonomy: plantDetails?.taxonomy || {},
              diseases: (data.result.disease?.suggestions || []).map((disease: any) => ({
                name: disease.name,
                probability: disease.probability,
                description: disease.description || `${disease.name} detected in your plant`,
                treatment: disease.treatment?.biological?.[0] || disease.treatment?.chemical?.[0] || "Consult a plant specialist for treatment options"
              }))
            }
          };
          
          console.log('🌱 [Plant-Identify] ✅ Enhanced data processed successfully');
          
          return new Response(
            JSON.stringify(enhancedResponse),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        return new Response(
          JSON.stringify(data),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );

      } catch (error) {
        console.error(`🌱 [Plant-Identify] Attempt ${attempt} failed:`, error);
        lastError = error;
        
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // All attempts failed
    console.error('🌱 [Plant-Identify] ❌ All attempts to Plant.id API failed');
    throw lastError;

  } catch (error) {
    console.error('🌱 [Plant-Identify] ❌ Function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to identify plant',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
