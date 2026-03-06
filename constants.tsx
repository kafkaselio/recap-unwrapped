
import React from 'react';
import { Camera, Music, Gamepad2, MapPin, Tablet, Image as ImageIcon, Film, Hash, Link as LinkIcon, TrendingUp } from 'lucide-react';
import { BucketConfig, BucketType } from './types';

export const BUCKET_CONFIGS: Record<BucketType, BucketConfig> = {
  photos: {
    type: 'photos',
    label: 'Photos',
    icon: <Camera className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-400',
    unit: 'Photos',
    metricLabel: 'Captures'
  },
  music: {
    type: 'music',
    label: 'Listening',
    icon: <Music className="w-5 h-5" />,
    color: 'from-emerald-500 to-green-400',
    unit: 'Plays',
    metricLabel: 'Times Played'
  },
  games: {
    type: 'games',
    label: 'Gaming',
    icon: <Gamepad2 className="w-5 h-5" />,
    color: 'from-pink-500 to-rose-400',
    unit: 'Hours',
    metricLabel: 'Hours Played'
  },
  location: {
    type: 'location',
    label: 'Check-ins',
    icon: <MapPin className="w-5 h-5" />,
    color: 'from-orange-500 to-amber-400',
    unit: 'Days',
    metricLabel: 'Days Stayed'
  },
  screens: {
    type: 'screens',
    label: 'Screens',
    icon: <Tablet className="w-5 h-5" />,
    color: 'from-purple-500 to-indigo-400',
    unit: 'Captures',
    metricLabel: 'Screenshots'
  },
  memes: {
    type: 'memes',
    label: 'Laughs',
    icon: <ImageIcon className="w-5 h-5" />,
    color: 'from-yellow-500 to-orange-400',
    unit: 'Saved',
    metricLabel: 'Memes Count'
  },
  movies: {
    type: 'movies',
    label: 'Media',
    icon: <Film className="w-5 h-5" />,
    color: 'from-red-500 to-pink-400',
    unit: 'Watched',
    metricLabel: 'Watch Time (Hrs)'
  },
  gifs: {
    type: 'gifs',
    label: 'Gifs',
    icon: <Hash className="w-5 h-5" />,
    color: 'from-cyan-500 to-blue-400',
    unit: 'Sends',
    metricLabel: 'Gifs Shared'
  },
  links: {
    type: 'links',
    label: 'Bookmarks',
    icon: <LinkIcon className="w-5 h-5" />,
    color: 'from-zinc-500 to-zinc-400',
    unit: 'Saves',
    metricLabel: 'Links Stored'
  },
  trends: {
    type: 'trends',
    label: 'Trends',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'from-fuchsia-500 to-purple-400',
    unit: 'Trends',
    metricLabel: 'Trends Logged'
  }
};

export const INITIAL_MOMENTS = [
  { id: '1', type: 'music' as BucketType, title: 'Midnight City', subtitle: 'M83', timestamp: new Date(), value: 4, unit: 'plays', imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200' },
  { id: '2', type: 'music' as BucketType, title: 'Blinding Lights', subtitle: 'The Weeknd', timestamp: new Date(), value: 8, unit: 'plays', imageUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=200' },
  { id: '3', type: 'photos' as BucketType, title: 'Beach Day Vibe', subtitle: 'Santa Monica', timestamp: new Date(), imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400' },
  { id: '4', type: 'games' as BucketType, title: 'Elden Ring', subtitle: 'RPG Masterpiece', timestamp: new Date(), value: 12, unit: 'hours', imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200' },
  { id: '5', type: 'location' as BucketType, title: 'Tokyo Ramen', subtitle: 'Ginza Dist.', timestamp: new Date(), value: 3, unit: 'days', imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=200' },
];
