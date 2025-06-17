
// Plant.ID API v3 Response Types
export interface PlantIdApiResponse {
  result: {
    classification: {
      suggestions: PlantIdSuggestion[];
    };
  };
  status: string;
  feedback?: string;
}

export interface PlantIdSuggestion {
  name: string;
  plant_name: string;
  probability: number;
  common_names?: string[];
  details?: PlantIdDetails;
  plant_details?: PlantIdDetails;
  similar_images?: Array<{
    id: string;
    url: string;
    similarity: number;
  }>;
}

export interface PlantIdDetails {
  common_names?: string[];
  scientific_name?: string;
  wiki_description?: {
    value: string;
    citation?: string;
  };
  description?: string;
  edible_parts?: string[];
  toxicity?: {
    human?: boolean;
    cat?: boolean;
    dog?: boolean;
  };
  propagation_methods?: string[];
  sunlight?: string[];
  watering?: {
    min: number;
    max: number;
  };
  growth_rate?: string;
  flowering_period?: string;
  url?: string;
  name_authority?: string;
  taxonomy?: {
    class?: string;
    family?: string;
    genus?: string;
    kingdom?: string;
    order?: string;
    phylum?: string;
  };
  synonyms?: string[];
}

export interface PlantIdHealthResponse {
  result: {
    is_healthy: boolean;
    is_healthy_probability: number;
    diseases: Array<{
      name: string;
      probability: number;
      description?: string;
      treatment?: {
        biological?: string[];
        chemical?: string[];
        prevention?: string[];
      };
    }>;
  };
  status: string;
}
