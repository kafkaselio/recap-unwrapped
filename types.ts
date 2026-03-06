
import React from 'react';

export type BucketType = 'photos' | 'music' | 'games' | 'location' | 'screens' | 'memes' | 'movies' | 'gifs' | 'links' | 'trends';

export interface Moment {
  id: string;
  type: BucketType;
  title: string;
  subtitle?: string;
  value?: number;
  unit?: string;
  timestamp: Date;
  imageUrl?: string;
  coverImageUrl?: string;
  additionalImages?: string[];
  notes?: string;
  link?: string;
  locationDetails?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
}

export interface BucketConfig {
  type: BucketType;
  label: string;
  icon: React.ReactNode;
  color: string;
  unit: string;
  metricLabel: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
}

export type ViewState = 'home' | 'bucket-detail' | 'wrapped' | 'yearly' | 'profile' | 'buckets-config' | 'calendar' | 'trash' | 'archive' | 'insights';

export interface SmartInsight {
  title: string;
  description: string;
  type: 'correlation' | 'trend' | 'suggestion';
  icon?: string;
}
