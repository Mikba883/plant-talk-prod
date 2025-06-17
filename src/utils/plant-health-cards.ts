
export interface HealthConditionCard {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  icon: string;
  image: string;
  description: string;
  treatment: string[];
  keywords?: string[];
}

export const conditionMap: Record<string, HealthConditionCard> = {
  leaf_yellowing: {
    id: 'leaf_yellowing',
    title: 'Leaf Yellowing',
    severity: 'medium',
    icon: '🍂',
    image: '/images/conditions/leaf-yellowing.jpg',
    description: 'Yellowing leaves, often starting from the bottom.',
    treatment: ['Reduce watering', 'Increase sunlight', 'Check soil drainage']
  },
  leaf_browning: {
    id: 'leaf_browning',
    title: 'Brown Leaf Edges',
    severity: 'medium',
    icon: '🟤',
    image: '/images/conditions/brown-edges.jpg',
    description: 'Crispy brown tips on the edges of leaves.',
    treatment: ['Increase humidity', 'Avoid dry heat', 'Mist the leaves']
  },
  pest_infestation: {
    id: 'pest_infestation',
    title: 'Pest Infestation',
    severity: 'high',
    icon: '🐞',
    image: '/images/conditions/pests.jpg',
    description: 'Tiny webs, visible insects, stippled or damaged leaves.',
    treatment: ['Isolate plant', 'Use neem oil or soap', 'Check undersides of leaves']
  },
  root_rot: {
    id: 'root_rot',
    title: 'Root Rot',
    severity: 'high',
    icon: '🧪',
    image: '/images/conditions/root-rot.jpg',
    description: 'Wilting and foul-smelling roots caused by overwatering.',
    treatment: ['Repot in dry soil', 'Remove mushy roots', 'Reduce watering']
  },
  powdery_mildew: {
    id: 'powdery_mildew',
    title: 'Powdery Mildew',
    severity: 'medium',
    icon: '🧂',
    image: '/images/conditions/mildew.jpg',
    description: 'White powder-like layer on leaves.',
    treatment: ['Remove infected leaves', 'Improve air circulation', 'Apply baking soda solution']
  },
  nutrient_deficiency: {
    id: 'nutrient_deficiency',
    title: 'Nutrient Deficiency',
    severity: 'low',
    icon: '🧬',
    image: '/images/conditions/nutrients.jpg',
    description: 'Pale leaves, stunted growth, or weak stems.',
    treatment: ['Use balanced fertilizer', 'Water properly', 'Avoid over-fertilizing']
  },
  leggy_growth: {
    id: 'leggy_growth',
    title: 'Leggy Growth',
    severity: 'low',
    icon: '🌱',
    image: '/images/conditions/leggy.jpg',
    description: 'Long, weak stems stretching toward light.',
    treatment: ['Provide more light', 'Rotate plant regularly', 'Prune weak stems']
  },
  mechanical_damage: {
    id: 'mechanical_damage',
    title: 'Mechanical Damage',
    severity: 'medium',
    icon: '🛠️',
    image: '/images/conditions/damage.jpg',
    description: 'Physical damage to leaves or stems.',
    treatment: ['Avoid handling plant roughly', 'Provide support if needed']
  },
  fungal_spots: {
    id: 'fungal_spots',
    title: 'Fungal Leaf Spots',
    severity: 'medium',
    icon: '🍄',
    image: '/images/conditions/fungal.jpg',
    description: 'Dark or black spots caused by fungus.',
    treatment: ['Prune affected leaves', 'Use antifungal spray', 'Reduce overhead watering']
  },
  wilting: {
    id: 'wilting',
    title: 'Wilting',
    severity: 'medium',
    icon: '🥀',
    image: '/images/conditions/wilt.jpg',
    description: 'Droopy, lifeless leaves from stress or root issues.',
    treatment: ['Water or repot as needed', 'Check for root rot or pests']
  },
  leaf_curling: {
    id: 'leaf_curling',
    title: 'Leaf Curling',
    severity: 'medium',
    icon: '🍥',
    image: '/images/conditions/curling.jpg',
    description: 'Leaves curling inward or outward from stress.',
    treatment: ['Adjust light exposure', 'Water moderately', 'Inspect for pests']
  },
  leaf_drop: {
    id: 'leaf_drop',
    title: 'Leaf Drop',
    severity: 'medium',
    icon: '🍃',
    image: '/images/conditions/drop.jpg',
    description: 'Leaves falling off due to sudden change or shock.',
    treatment: ['Avoid relocation', 'Stabilize temperature', 'Check watering routine']
  },
  bacterial_leaf_spot: {
    id: 'bacterial_leaf_spot',
    title: 'Bacterial Leaf Spot',
    severity: 'high',
    icon: '🧫',
    image: '/images/conditions/bacterial.jpg',
    description: 'Water-soaked lesions turning brown or black.',
    treatment: ['Remove infected leaves', 'Avoid overhead watering', 'Improve circulation']
  },
  edema: {
    id: 'edema',
    title: 'Edema',
    severity: 'low',
    icon: '💧',
    image: '/images/conditions/edema.jpg',
    description: 'Blister-like bumps on the underside of leaves.',
    treatment: ['Reduce watering frequency', 'Increase light exposure']
  },
  chlorosis: {
    id: 'chlorosis',
    title: 'Chlorosis',
    severity: 'medium',
    icon: '🟡',
    image: '/images/conditions/chlorosis.jpg',
    description: 'Yellowing between leaf veins due to nutrient issues.',
    treatment: ['Use iron-rich fertilizer', 'Adjust soil pH']
  },
  rust: {
    id: 'rust',
    title: 'Rust',
    severity: 'medium',
    icon: '🧡',
    image: '/images/conditions/rust.jpg',
    description: 'Orange, powdery spots on leaf surfaces.',
    treatment: ['Remove infected leaves', 'Apply fungicide', 'Avoid leaf wetting']
  },
  damping_off: {
    id: 'damping_off',
    title: 'Damping Off',
    severity: 'high',
    icon: '🧊',
    image: '/images/conditions/damping.jpg',
    description: 'Seedlings collapse due to fungal infection.',
    treatment: ['Use sterile soil', 'Avoid overwatering seedlings']
  },
  aphids: {
    id: 'aphids',
    title: 'Aphids',
    severity: 'high',
    icon: '🐜',
    image: '/images/conditions/aphids.jpg',
    description: 'Tiny insects that feed on plant sap.',
    treatment: ['Spray with water', 'Use neem oil', 'Introduce ladybugs']
  },
  spider_mites: {
    id: 'spider_mites',
    title: 'Spider Mites',
    severity: 'high',
    icon: '🕷️',
    image: '/images/conditions/mites.jpg',
    description: 'Tiny red mites that cause webbing and speckled leaves.',
    treatment: ['Shower plant', 'Use miticide or neem oil']
  },
  thrips: {
    id: 'thrips',
    title: 'Thrips',
    severity: 'high',
    icon: '🪳',
    image: '/images/conditions/thrips.jpg',
    description: 'Slender insects causing silver streaks or discoloration.',
    treatment: ['Use sticky traps', 'Spray with insecticidal soap']
  },
  whiteflies: {
    id: 'whiteflies',
    title: 'Whiteflies',
    severity: 'medium',
    icon: '🦟',
    image: '/images/conditions/whiteflies.jpg',
    description: 'Small white insects that swarm when disturbed.',
    treatment: ['Use yellow sticky traps', 'Spray with insecticidal soap']
  },
  scale_insects: {
    id: 'scale_insects',
    title: 'Scale Insects',
    severity: 'medium',
    icon: '📎',
    image: '/images/conditions/scale.jpg',
    description: 'Brown or white bumps on stems and leaves.',
    treatment: ['Scrape off gently', 'Apply horticultural oil']
  },
  mealybugs: {
    id: 'mealybugs',
    title: 'Mealybugs',
    severity: 'medium',
    icon: '🧼',
    image: '/images/conditions/mealy.jpg',
    description: 'White cottony masses on leaves and stems.',
    treatment: ['Wipe with alcohol', 'Use neem oil']
  },
  fungal_root_rot: {
    id: 'fungal_root_rot',
    title: 'Fungal Root Rot',
    severity: 'high',
    icon: '🪰',
    image: '/images/conditions/fungal-root.jpg',
    description: 'Fungus attacking roots causing mushiness and smell.',
    treatment: ['Repot in clean soil', 'Trim roots', 'Avoid standing water']
  },
  leaf_scab: {
    id: 'leaf_scab',
    title: 'Leaf Scab',
    severity: 'medium',
    icon: '🧟',
    image: '/images/conditions/scab.jpg',
    description: 'Scaly or crusty lesions on leaves.',
    treatment: ['Remove affected foliage', 'Improve air flow', 'Apply fungicide']
  }
};
