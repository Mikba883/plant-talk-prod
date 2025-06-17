
export const mockPlants = [
  {
    id: 'peace-lily',
    name: 'Peace Lily',
    scientificName: 'Spathiphyllum wallisii',
    confidence: 0.95,
    health: 'good' as const,
    message: "Hi there! I'm your Peace Lily and I'm feeling pretty good today. My leaves look healthy and I'm enjoying the filtered light. I might need water soon though - I like my soil to stay slightly moist. When my leaves start to droop, that's my way of telling you I'm thirsty!",
    careInfo: {
      light: 'Bright, indirect light. Can tolerate low light but will bloom better with more brightness.',
      water: 'Keep soil consistently moist but not soggy. Water when the top inch of soil is dry.',
      temperature: 'Prefers 65-80°F (18-27°C). Keep away from cold drafts and heat sources.',
      fertilize: 'Feed monthly with balanced liquid fertilizer during growing season (spring through fall).'
    }
  },
  {
    id: 'snake-plant',
    name: 'Snake Plant',
    scientificName: 'Dracaena trifasciata',
    confidence: 0.98,
    health: 'good' as const,
    message: "Hello friend! I'm your Snake Plant, one of the toughest plants around. I'm looking strong and healthy! I don't need much attention - just some occasional water when my soil is completely dry. I'm perfect for plant beginners or busy plant parents!",
    careInfo: {
      light: 'Tolerates various light conditions from low to bright indirect light.',
      water: 'Allow soil to dry completely between waterings. Water less in winter.',
      temperature: 'Adaptable to temperatures between 55-85°F (13-29°C).',
      fertilize: 'Feed lightly once or twice during growing season with mild cactus fertilizer.'
    }
  },
  {
    id: 'monstera',
    name: 'Monstera',
    scientificName: 'Monstera deliciosa',
    confidence: 0.93,
    health: 'fair' as const,
    message: "Hey there! I'm your Monstera, also known as Swiss Cheese Plant. Some of my leaves are looking a bit yellow - I might be getting too much direct sunlight or need a little less water. I like my soil to dry out somewhat between waterings. A support stake would help me grow upright and show off my beautiful fenestrated leaves!",
    careInfo: {
      light: 'Medium to bright indirect light. Avoid direct sunlight which can burn leaves.',
      water: 'Water when the top 1-2 inches of soil are dry. Reduce watering in winter.',
      temperature: 'Prefers 65-85°F (18-29°C). Protect from drafts and cold temperatures.',
      fertilize: 'Feed monthly during spring and summer with balanced liquid fertilizer.'
    }
  },
  {
    id: 'fiddle-leaf',
    name: 'Fiddle Leaf Fig',
    scientificName: 'Ficus lyrata',
    confidence: 0.89,
    health: 'needs-attention' as const,
    message: "Oh no, I'm not feeling my best! My leaves have some brown spots and I'm looking a bit droopy. I'm quite sensitive to changes in my environment. I need consistent bright, indirect light and a regular watering schedule. Please check if I'm near any drafts or if my soil has been too wet lately. With some care adjustments, I can bounce back!",
    careInfo: {
      light: 'Bright, filtered light. Some morning direct sun is beneficial but protect from harsh afternoon sun.',
      water: 'Water thoroughly when top 1-2 inches of soil is dry. Ensure pot has drainage.',
      temperature: 'Consistent 65-75°F (18-24°C). Protect from drafts and sudden temperature changes.',
      fertilize: 'Feed with diluted fertilizer monthly during growing season (spring through early fall).'
    }
  },
  {
    id: 'pothos',
    name: 'Golden Pothos',
    scientificName: 'Epipremnum aureum',
    confidence: 0.97,
    health: 'good' as const,
    message: "Hi there! I'm your Golden Pothos and I'm thriving! My vines are growing nicely and my variegated leaves are showing beautiful patterns. I'm one of the easiest houseplants to care for - I can handle various light conditions and won't mind if you forget to water me occasionally. I'm a great air purifier too!",
    careInfo: {
      light: 'Adaptable to low to bright indirect light. More variegation occurs with brighter light.',
      water: 'Allow soil to dry out between waterings. Tolerates occasional drought.',
      temperature: 'Comfortable in normal home temperatures between 60-80°F (15-27°C).',
      fertilize: 'Feed with balanced houseplant fertilizer every 2-3 months during growing season.'
    }
  }
];
