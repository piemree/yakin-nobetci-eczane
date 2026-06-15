export interface Eczane {
  id: string;
  name: string;
  district: string;
  dutyZone: string;
  address: string;
  landmark: string;
  phones: string[];
  lat: number;
  lng: number;
  dutyStart: string;
  dutyEnd: string;
  mapsUrl: string;
}

export interface Ilce {
  id: string;
  name: string;
  slug: string;
  beoId?: string;
  dutyZone?: string;
}

export interface Mahalle {
  name: string;
  district: string;
  slug: string;
  population: number;
  area: number;
}

export type ScopeType = "all" | "district" | "mahalle";

export interface Scope {
  type: ScopeType;
  label: string;
  district?: string;
  mahalle?: Mahalle;
}

export interface EczaneWithDistance extends Eczane {
  distanceMeters?: number;
}

export interface NobetciData {
  eczaneler: Eczane[];
  date: string;
  dateLabel: string;
  fetchedAt: string;
  city: string;
  cityName: string;
}

export type GeolocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";
