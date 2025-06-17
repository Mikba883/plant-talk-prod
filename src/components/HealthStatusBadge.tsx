
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HealthStatusBadgeProps {
  healthProbability?: number;
}

export const getHealthStatus = (probability?: number) => {
  if (!probability) return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', emoji: '❓' };
  
  if (probability >= 0.95) return { label: 'Elite', color: 'bg-[#00cc66] text-white', emoji: '🌟' };
  if (probability >= 0.90) return { label: 'Healthy', color: 'bg-green-500 text-white', emoji: '✅' };
  if (probability >= 0.75) return { label: 'Good, monitor', color: 'bg-yellow-400 text-black', emoji: '⚠️' };
  if (probability >= 0.60) return { label: 'Slightly stressed', color: 'bg-yellow-400 text-black', emoji: '😐' };
  if (probability >= 0.40) return { label: 'Unhealthy', color: 'bg-orange-400 text-white', emoji: '🔶' };
  return { label: 'Critical', color: 'bg-red-500 text-white', emoji: '❗' };
};

export const getHealthCategory = (probability: number): 'good' | 'fair' | 'needs-attention' => {
  if (probability >= 0.9) return 'good';
  if (probability >= 0.6) return 'fair';
  return 'needs-attention';
};

const HealthStatusBadge: React.FC<HealthStatusBadgeProps> = ({ healthProbability }) => {
  const healthStatus = getHealthStatus(healthProbability);

  return (
    <Badge className={cn(
      "px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 rounded-md",
      healthStatus.color
    )}>
      {healthStatus.emoji} {healthStatus.label} {healthProbability ? `(${Math.round(healthProbability * 100)}%)` : ''}
    </Badge>
  );
};

export default HealthStatusBadge;
