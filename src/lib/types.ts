export type Activity = {
  id: string;
  date: string;
  day: string;
  startTime: string;
  endTime?: string;
  title: string;
  category?: string;
  tags?: string[];
  location?: string;
  facilitator?: string;
  country?: string;
  language?: string;
  description?: string;
  photo?: string;
  photos?: string[];
  sourcePage?: number;
};

export type Teacher = {
  id: string;
  name: string;
  facilitatorNames: string[];
  bio: string;
  country?: string;
  photo?: string;
  photos?: string[];
};

/** Position on the event's venue map, as a percentage (0–100) of the image width/height. */
export type VenueMapPoint = { x: number; y: number };

export type Venue = {
  id: string;
  name: string;
  description?: string;
  /** Where the pin sits on the venue map; venues without it are not drawn. */
  mapPoint?: VenueMapPoint;
  /** Pin color (any CSS color). Defaults to a palette color when missing. */
  color?: string;
  /** Legend number printed inside the pin. Assigned in order when missing. */
  number?: number;
  /** Rank in the quick-access chip row above the map (1 = first); absent = not featured. */
  featured?: number;
  /** "landmark" = map-only point (restrooms, parking) that is never a program venue. */
  kind?: "venue" | "landmark";
};

export type Category = {
  id: string;
  name: string;
};

export type InfoPage = {
  id: string;
  title: string;
  sourcePage?: number;
  content: string;
};
