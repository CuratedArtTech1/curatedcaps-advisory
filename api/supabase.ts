import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Client = {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  type: string;
  created_at: string;
  updated_at: string;
};

export type Artwork = {
  id: string;
  client_id?: string;
  title: string;
  artist: string;
  year?: string;
  medium?: string;
  dimensions?: string;
  condition: string;
  location?: string;
  cost?: number;
  price?: number;
  insurance_value?: number;
  provenance?: string;
  exhibition?: string;
  literature?: string;
  notes?: string;
  owner_info?: string;
  image_url?: string;
  image_data?: string;
  image_data_url?: string;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export type ArtworkDocument = {
  id: string;
  artwork_id: string;
  file_name: string;
  file_data: string;
  file_type: string;
  file_size: number;
  description?: string;
  created_at: string;
  updated_at: string;
};
