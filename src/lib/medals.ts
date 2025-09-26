import type { MedalInfo } from '@/lib/types';
import {
  HeartHandshake,
  Landmark,
  Medal,
  Megaphone,
  MousePointerClick,
  Scale,
  Users,
  Wrench,
} from 'lucide-react';

export const medals: MedalInfo[] = [
  {
    title: "The People's Integrity Medal",
    description:
      'For individuals with consistent public endorsement and a clean public trust score.',
    icon: Medal,
  },
  {
    title: 'Fixer of the Year',
    description: 'For someone who turned a bad reputation into a good one.',
    icon: Wrench,
  },
  {
    title: 'Civic Hero Medal',
    description: 'For a whistleblower or someone who spoke up with impact.',
    icon: Megaphone,
  },
  {
    title: 'Justice Advocate Medal',
    description: 'For resolving multiple disputes peacefully on the platform.',
    icon: Scale,
  },
  {
    title: 'Community Builder Medal',
    description: 'For organizations or people improving their neighborhood.',
    icon: Users,
  },
  {
    title: 'Golden Artisan Medal',
    description: 'For the best-rated technician, craftsman, or skilled worker.',
    icon: HeartHandshake,
  },
  {
    title: 'Public Official of the Year',
    description: 'For a transparent and accountable government employee.',
    icon: Landmark,
  },
  {
    title: 'Digital Citizen Medal',
    description: 'For respectful, helpful online behavior.',
    icon: MousePointerClick,
  },
];
