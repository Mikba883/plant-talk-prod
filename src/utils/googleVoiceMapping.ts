
/**
 * Google Cloud Text-to-Speech voice mapping for plants
 */

export interface GoogleVoiceConfig {
  voiceName: string;
  languageCode: string;
}

/**
 * Map plant type to specific Google Cloud voice
 */
export const getVoiceByPlantType = (plantName: string): GoogleVoiceConfig => {
  const name = plantName.toLowerCase();
  
  // Flowers - gentle, feminine voice
  if (name.includes('sunflower') || name.includes('rose') || name.includes('orchid') || 
      name.includes('lily') || name.includes('tulip') || name.includes('daisy') ||
      name.includes('hibiscus') || name.includes('jasmine') || name.includes('begonia') ||
      name.includes('lavender') || name.includes('petunia')) {
    return {
      voiceName: "en-US-Wavenet-F", // Female, gentle voice
      languageCode: "en-US"
    };
  }
  
  // Desert plants - sturdy, robust voice  
  if (name.includes('cactus') || name.includes('succulent') || name.includes('aloe') ||
      name.includes('echeveria') || name.includes('jade') || name.includes('agave') ||
      name.includes('barrel cactus') || name.includes('prickly pear') ||
      name.includes('sansevieria') || name.includes('snake plant')) {
    return {
      voiceName: "en-US-Wavenet-B", // Male, sturdy voice
      languageCode: "en-US"
    };
  }
  
  // Tropical plants - warm, expressive voice
  if (name.includes('monstera') || name.includes('banana') || name.includes('palm') ||
      name.includes('bird of paradise') || name.includes('bromeliad') || name.includes('anthurium') ||
      name.includes('philodendron') || name.includes('calathea') || name.includes('alocasia') ||
      name.includes('fiddle leaf fig') || name.includes('rubber tree')) {
    return {
      voiceName: "en-AU-Wavenet-D", // Australian, warm voice
      languageCode: "en-AU"
    };
  }
  
  // Herbs - friendly, clear voice
  if (name.includes('basil') || name.includes('mint') || name.includes('thyme') ||
      name.includes('rosemary') || name.includes('sage') || name.includes('oregano') ||
      name.includes('parsley') || name.includes('cilantro') || name.includes('chives')) {
    return {
      voiceName: "en-US-Wavenet-C", // Neutral, friendly voice
      languageCode: "en-US"
    };
  }
  
  // Trees - deep, mature voice
  if (name.includes('tree') || name.includes('oak') || name.includes('maple') ||
      name.includes('pine') || name.includes('elm') || name.includes('birch') ||
      name.includes('ficus') || name.includes('bonsai')) {
    return {
      voiceName: "en-GB-Wavenet-B", // British, mature voice
      languageCode: "en-GB"
    };
  }
  
  // Ferns - soft, gentle voice
  if (name.includes('fern') || name.includes('bracken') || name.includes('maidenhair')) {
    return {
      voiceName: "en-US-Wavenet-D", // Soft, gentle voice
      languageCode: "en-US"
    };
  }
  
  // Default voice for unrecognized plants
  return {
    voiceName: "en-US-Wavenet-A", // Default neutral voice
    languageCode: "en-US"
  };
};
