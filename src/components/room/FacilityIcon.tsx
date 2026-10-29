import {
  Bath,
  BedDouble,
  Briefcase,
  CigaretteOff,
  Coffee,
  Dumbbell,
  ParkingCircle,
  ShieldCheck,
  Snowflake,
  Sofa,
  Tv,
  Utensils,
  Waves,
  Wifi,
  Wine,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FacilityId } from '@/types/booking';

const ICONS: Record<FacilityId, LucideIcon> = {
  wifi: Wifi,
  ac: Snowflake,
  tv: Tv,
  shower: Bath,
  bathtub: Bath,
  breakfast: Coffee,
  desk: Briefcase,
  safe: ShieldCheck,
  minibar: Wine,
  sofa: Sofa,
  non_smoking: CigaretteOff,
  pool: Waves,
  gym: Dumbbell,
  parking: ParkingCircle,
  restaurant: Utensils,
};

interface FacilityIconProps {
  id: FacilityId;
  size?: number;
}

export const FacilityIcon = ({ id, size = 14 }: FacilityIconProps) => {
  const Icon = ICONS[id] ?? BedDouble;
  return <Icon size={size} aria-hidden="true" />;
};
