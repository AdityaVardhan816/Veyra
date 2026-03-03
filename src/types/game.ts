export type Game = {
  id: string;
  slug: string;
  title: string;
  coverUrl: string;
  bannerUrl: string;
  genres: string[];
  platforms: string[];
  releaseDate: string;
  rating: number;
  ratingsCount: number;
  dlcCount: number;
  trailerCount?: number;
  newsCount?: number;
  trailerUrl: string;
  summary: string;
  tags: string[];
  featured?: boolean;
};
