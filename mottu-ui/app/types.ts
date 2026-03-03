export type MemoryMedia = {
  id?: number;
  type: "PHOTO" | "VIDEO" | "AUDIO";
  url: string;
  thumbnailUrl?: string | null;
};

export type Memory = {
  id: number;
  title: string;
  date: string; // ISO date string
  caption?: string | null;
  feelingNote?: string | null;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdByEmail?: string | null;
  media: MemoryMedia[];
};

export type MemoryFormData = {
  title: string;
  date: string;
  caption: string;
  feelingNote: string;
  locationName: string;
  latitude: string;
  longitude: string;
  media: MemoryMedia[];
};

