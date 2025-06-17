
/**
 * Voice mapping utility for dynamic voice selection based on plant characteristics
 */

import { getVoiceByPlantType } from './googleVoiceMapping';

export interface VoiceConfig {
  voiceName: string;
  languageCode: string;
  speed?: number;
  pitch?: number;
  fallback?: boolean;
}

/**
 * Categorize plant based on name, family, or other characteristics
 */
export const categorizePlant = (plantData: any): string => {
  const name = (plantData.name || '').toLowerCase();
  const scientificName = (plantData.scientificName || '').toLowerCase();
  const family = (plantData.plant_details?.taxonomy?.family || '').toLowerCase();
  const genus = (plantData.plant_details?.taxonomy?.genus || '').toLowerCase();
  
  // Flowers
  if (name.includes('orchid') || name.includes('rose') || name.includes('lavender') || 
      name.includes('lily') || name.includes('tulip') || name.includes('daisy') ||
      name.includes('hibiscus') || name.includes('jasmine') || name.includes('begonia') ||
      family.includes('orchidaceae') || family.includes('rosaceae')) {
    return 'flowers';
  }
  
  // Desert plants and succulents
  if (name.includes('cactus') || name.includes('succulent') || name.includes('aloe') ||
      name.includes('echeveria') || name.includes('jade') || name.includes('agave') ||
      name.includes('barrel cactus') || name.includes('prickly pear') ||
      family.includes('cactaceae') || family.includes('crassulaceae')) {
    return 'desert';
  }
  
  // Tropical plants
  if (name.includes('monstera') || name.includes('banana') || name.includes('palm') ||
      name.includes('bird of paradise') || name.includes('bromeliad') || name.includes('anthurium') ||
      name.includes('philodendron') || name.includes('calathea') || name.includes('alocasia') ||
      family.includes('arecaceae') || family.includes('araceae')) {
    return 'tropical';
  }
  
  // Herbs
  if (name.includes('basil') || name.includes('mint') || name.includes('thyme') ||
      name.includes('rosemary') || name.includes('sage') || name.includes('oregano') ||
      name.includes('parsley') || name.includes('cilantro')) {
    return 'herbs';
  }
  
  // Trees
  if (name.includes('tree') || name.includes('oak') || name.includes('maple') ||
      name.includes('pine') || name.includes('elm') || name.includes('birch') ||
      name.includes('ficus') || genus.includes('quercus') || genus.includes('acer')) {
    return 'trees';
  }
  
  // Ferns
  if (name.includes('fern') || name.includes('bracken') || name.includes('maidenhair') ||
      family.includes('polypodiaceae') || family.includes('pteridaceae')) {
    return 'ferns';
  }
  
  return 'default';
};

/**
 * Get voice configuration for a plant using Google Cloud TTS voices
 */
export const getVoiceConfig = (plantData: any): VoiceConfig => {
  const plantName = plantData.name || 'unknown plant';
  return getVoiceByPlantType(plantName);
};

/**
 * Generate SSML-enhanced text with natural pauses and emphasis
 */
export const enhanceTextWithSSML = (text: string, emphasis: string[] = [], pauses: string[] = []): string => {
  let enhancedText = text;
  
  // Add emphasis to specific words
  emphasis.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    enhancedText = enhancedText.replace(regex, `<emphasis level="moderate">${word}</emphasis>`);
  });
  
  // Add pauses after specific phrases
  pauses.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    enhancedText = enhancedText.replace(regex, `${phrase}<break time="0.5s"/>`);
  });
  
  // Add natural pauses after exclamation marks and question marks
  enhancedText = enhancedText.replace(/!/g, '!<break time="0.4s"/>');
  enhancedText = enhancedText.replace(/\?/g, '?<break time="0.5s"/>');
  
  // Add slight pauses after commas and periods
  enhancedText = enhancedText.replace(/,/g, ',<break time="0.3s"/>');
  enhancedText = enhancedText.replace(/\./g, '.<break time="0.6s"/>');
  
  // Add pauses after ellipses for dramatic effect
  enhancedText = enhancedText.replace(/\.\.\./g, '<break time="1s"/>');
  
  // Wrap in SSML speak tags
  return `<speak>${enhancedText}</speak>`;
};

/**
 * Generate contextual messages based on plant health and status
 */
export const generatePlantMessage = (plantData: any, isPremium: boolean = false): string => {
  const plantName = plantData.name || "Unknown Plant";
  const healthProbability = plantData.healthProbability || 0.8;
  const diseases = plantData.diseases || [];
  
  // Base greeting with natural pauses
  let message = `Hello! I'm your ${plantName}...`;
  
  if (isPremium) {
    // Premium users get detailed health information
    if (healthProbability >= 0.95) {
      message += " I'm feeling absolutely fantastic! My leaves are vibrant, and I'm growing beautifully.";
    } else if (healthProbability >= 0.85) {
      message += " I'm doing really well! I feel healthy and strong.";
    } else if (healthProbability >= 0.70) {
      message += " I'm doing okay... but I could use a little more attention to feel my best.";
    } else if (healthProbability >= 0.50) {
      message += " I'm feeling a bit stressed and could really use some care.";
    } else {
      message += " I'm not feeling well at all... and need urgent attention!";
    }
    
    // Add disease information if available
    if (diseases.length > 0) {
      const primaryDisease = diseases[0];
      message += ` I might be showing signs of ${primaryDisease.name}...`;
    }
    
    message += " Feel free to ask me any questions about my care!";
    
  } else {
    // Free users get basic care information with premium CTA
    const waterInfo = plantData.careInfo?.water || "regular watering";
    const lightInfo = plantData.careInfo?.light || "moderate to bright indirect light";
    
    message += ` I usually enjoy ${lightInfo}, and I need ${waterInfo}.`;
    message += " If you really want to take care of me... you can unlock Premium Mode! It lets me tell you how I'm actually feeling, what symptoms I have, and what I truly need to thrive.";
    message += " Would you like to learn more?";
  }
  
  return message;
};

/**
 * Generate enhanced SSML text for different scenarios
 */
export const generateEnhancedMessage = (plantData: any, isPremium: boolean = false): string => {
  const baseMessage = generatePlantMessage(plantData, isPremium);
  
  // Words to emphasize based on context
  const emphasisWords = ['fantastic', 'Premium Mode', 'urgent', 'stressed', 'healthy', 'vibrant'];
  
  // Phrases that should have pauses
  const pausePhrases = [
    `Hello! I'm your ${plantData.name || 'plant'}`,
    'Feel free to ask me',
    'Premium Mode',
    'Would you like to learn more'
  ];
  
  return enhanceTextWithSSML(baseMessage, emphasisWords, pausePhrases);
};
