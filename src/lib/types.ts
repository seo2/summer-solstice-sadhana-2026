export type Activity = {
  id: string;
  date: string;
  day: string;
  startTime: string;
  endTime?: string;
  title: string;
  category?: string;
  location?: string;
  facilitator?: string;
  country?: string;
  language?: string;
  description?: string;
  photo?: string;
  photos?: string[];
  sourcePage?: number;
};

export type Venue = {
  id: string;
  name: string;
  description?: string;
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
