
import React, { useEffect, useState } from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { 
  Droplet, 
  Sun, 
  ThermometerSun,
  CloudSun
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlantCareChartProps {
  plantType: string;
  careInfo?: {
    water: string;
    light: string;
    temperature: string;
    humidity?: string;
  };
}

const PlantCareChart: React.FC<PlantCareChartProps> = ({ plantType, careInfo }) => {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  
  console.log('📊 [PlantCareChart] Props ricevute:');
  console.log('📊 [PlantCareChart] plantType:', plantType);
  console.log('📊 [PlantCareChart] careInfo:', careInfo);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ MIGLIORATO: Parser per dati Plant.ID API - stesso della PlantCareInstructions
  const parseApiCareData = (careInfo?: { water: string; light: string; temperature: string; humidity?: string }) => {
    const result = {
      light: 70,    // default
      water: 60,    // default  
      humidity: 50, // default
      temperature: 65 // default
    };

    if (!careInfo) {
      console.log('📊 [PlantCareChart] No careInfo provided, using defaults');
      return result;
    }

    // ✅ ANALISI LUCE da Plant.ID API
    if (careInfo.light) {
      const lightText = careInfo.light.toLowerCase();
      console.log('📊 [PlantCareChart] Analyzing light:', lightText);
      
      if (lightText.includes('full sun') || lightText.includes('direct sun') || lightText.includes('bright light')) {
        result.light = 90;
        console.log('📊 [PlantCareChart] High light requirement detected');
      } else if (lightText.includes('bright') && lightText.includes('indirect')) {
        result.light = 70;
        console.log('📊 [PlantCareChart] Medium-high light requirement detected');
      } else if (lightText.includes('medium') || lightText.includes('moderate')) {
        result.light = 55;
        console.log('📊 [PlantCareChart] Medium light requirement detected');
      } else if (lightText.includes('low') || lightText.includes('shade') || lightText.includes('dim')) {
        result.light = 35;
        console.log('📊 [PlantCareChart] Low light requirement detected');
      }
    }

    // ✅ ANALISI ACQUA da Plant.ID API
    if (careInfo.water) {
      const waterText = careInfo.water.toLowerCase();
      console.log('📊 [PlantCareChart] Analyzing water:', waterText);
      
      if (waterText.includes('daily') || waterText.includes('frequent') || waterText.includes('moist')) {
        result.water = 85;
        console.log('📊 [PlantCareChart] High water requirement detected');
      } else if (waterText.includes('every 2-3 days') || waterText.includes('regular')) {
        result.water = 70;
        console.log('📊 [PlantCareChart] Medium-high water requirement detected');
      } else if (waterText.includes('weekly') || waterText.includes('every 7') || waterText.includes('when.*dry')) {
        result.water = 45;
        console.log('📊 [PlantCareChart] Medium water requirement detected');
      } else if (waterText.includes('dry') || waterText.includes('drought') || waterText.includes('sparingly') || waterText.includes('every 10') || waterText.includes('every 14')) {
        result.water = 25;
        console.log('📊 [PlantCareChart] Low water requirement detected');
      }
    }

    // ✅ ANALISI UMIDITA' da Plant.ID API
    if (careInfo.humidity) {
      const humidityText = careInfo.humidity.toLowerCase();
      console.log('📊 [PlantCareChart] Analyzing humidity:', humidityText);
      
      if (humidityText.includes('high') || humidityText.includes('humid') || humidityText.includes('tropical')) {
        result.humidity = 80;
        console.log('📊 [PlantCareChart] High humidity requirement detected');
      } else if (humidityText.includes('medium') || humidityText.includes('moderate')) {
        result.humidity = 50;
        console.log('📊 [PlantCareChart] Medium humidity requirement detected');
      } else if (humidityText.includes('low') || humidityText.includes('dry')) {
        result.humidity = 30;
        console.log('📊 [PlantCareChart] Low humidity requirement detected');
      }
    }

    // ✅ ANALISI TEMPERATURA da Plant.ID API
    if (careInfo.temperature) {
      const tempText = careInfo.temperature.toLowerCase();
      console.log('📊 [PlantCareChart] Analyzing temperature:', tempText);
      
      if (tempText.includes('warm') || tempText.includes('hot') || tempText.includes('25') || tempText.includes('27')) {
        result.temperature = 80;
        console.log('📊 [PlantCareChart] High temperature requirement detected');
      } else if (tempText.includes('cool') || tempText.includes('cold') || tempText.includes('15') || tempText.includes('16')) {
        result.temperature = 40;
        console.log('📊 [PlantCareChart] Low temperature requirement detected');
      }
      // Altrimenti mantiene il default medio (65)
    }

    console.log('📊 [PlantCareChart] Final parsed values:', result);
    return result;
  };

  // Different care requirements based on plant type and API data
  const careData = React.useMemo(() => {
    console.log('📊 [PlantCareChart] Generating care data...');
    
    // ✅ Prima usa i dati Plant.ID API
    const apiValues = parseApiCareData(careInfo);
    
    // Prepara la struttura dati per il radar chart con tooltip migliorati
    let data = [
      { 
        name: isMobile ? 'Light' : 'Light', 
        displayName: 'Light',
        value: apiValues.light, 
        fullMark: 100, 
        icon: Sun, 
        color: '#F97316',
        tooltip: careInfo?.light || 'Bright indirect light (moderate to high intensity)'
      },
      { 
        name: isMobile ? 'Water' : 'Water', 
        displayName: 'Water',
        value: apiValues.water, 
        fullMark: 100, 
        icon: Droplet, 
        color: '#0EA5E9',
        tooltip: careInfo?.water || 'Water when top 2 inches of soil are dry'
      },
      { 
        name: isMobile ? 'Humid.' : 'Humidity', 
        displayName: 'Humidity',
        value: apiValues.humidity, 
        fullMark: 100, 
        icon: CloudSun, 
        color: '#0EA5E9',
        tooltip: careInfo?.humidity || 'Medium humidity (40-60%)'
      },
      { 
        name: isMobile ? 'Temp.' : 'Temperature', 
        displayName: 'Temperature',
        value: apiValues.temperature, 
        fullMark: 100, 
        icon: ThermometerSun, 
        color: '#D946EF',
        tooltip: careInfo?.temperature || 'Ideal range: 18°C – 24°C'
      }
    ];

    // ✅ Solo come backup: aggiustamenti basati sul tipo di pianta (se API non è specifica)
    const lowerPlantType = plantType.toLowerCase();
    console.log('📊 [PlantCareChart] Backup adjustments for plant type:', lowerPlantType);
    
    if (lowerPlantType.includes('cactus') || lowerPlantType.includes('succulent')) {
      console.log('📊 [PlantCareChart] Cactus/succulent backup adjustments');
      // Solo se i valori API sono troppo generici
      if (data[0].value > 80) data[0].value = Math.max(data[0].value, 90); // Light: più alto
      if (data[1].value > 40) data[1].value = Math.min(data[1].value, 25); // Water: più basso  
      if (data[2].value > 50) data[2].value = 30; // Humidity: basso
    } else if (lowerPlantType.includes('fern') || lowerPlantType.includes('tropical')) {
      console.log('📊 [PlantCareChart] Fern/tropical backup adjustments');
      // Solo se i valori API sono troppo generici
      if (data[0].value > 70) data[0].value = Math.min(data[0].value, 50); // Light: più basso
      if (data[1].value < 60) data[1].value = Math.max(data[1].value, 75); // Water: più alto
      if (data[2].value < 60) data[2].value = 80; // Humidity: alto
    }

    console.log('📊 [PlantCareChart] Final care data:', data);
    return data;
  }, [plantType, isMobile, careInfo]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md text-xs max-w-xs">
          <p className="font-medium">{data.displayName}</p>
          <p className="text-muted-foreground">{data.tooltip}</p>
        </div>
      );
    }
    return null;
  };

  if (!mounted) {
    return (
      <div className="h-72 w-full">
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-plant-dark-green border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={careData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ fill: '#666', fontSize: 12 }}
            tickLine={false}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]}
            axisLine={false}
            tick={{ fill: '#666', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar 
            name="Optimal Level" 
            dataKey="value" 
            stroke="#4CAF50" 
            fill="#8BC34A" 
            fillOpacity={0.6} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlantCareChart;
