import type { MedalInfo } from '@/lib/types';
import {
  MessageSquareOff,
  Recycle,
  GitFork,
  Bot,
  Ghost,
  ShieldAlert,
} from 'lucide-react';

export const shameMedals: MedalInfo[] = [
  {
    title: 'The Ghoster',
    description:
      'For individuals who consistently fail to respond to direct inquiries or disputes.',
    icon: Ghost,
  },
  {
    title: 'The Spammer',
    description:
      'Awarded for posting repetitive, low-quality, or off-topic content.',
    icon: Recycle,
  },
  {
    title: 'The Troll',
    description: 'For users who consistently leave inflammatory or abusive comments.',
    icon: ShieldAlert,
  },
  {
    title: 'The Echo Chamber',
    description: 'For only interacting with content that confirms their own biases.',
    icon: MessageSquareOff,
  },
  {
    title: 'The Provocateur',
    description: 'For escalating disputes without contributing to a resolution.',
    icon: GitFork,
  },
  {
    title: 'The Automaton',
    description:
      'For behavior so repetitive and predictable it could be mistaken for a bot.',
    icon: Bot,
  },
];
