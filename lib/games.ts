// lib/games.ts
export type Game = {
  slug: string;
  title: string;
  publisher: string;
  cover: string; // 1:1
  banner: string; // wide
  rating: number; // 0..5
};

export const GAMES: Game[] = [
  {
    slug: "mobile-legends",
    title: "Mobile Legends",
    publisher: "Moonton",
    cover:
      "https://sbclbzad8s.ufs.sh/f/vI07edVR8nimBHyqimTrX8OM2IxYqlGKDH6TeJ5faC7mvZAn",
    banner:
      "https://sbclbzad8s.ufs.sh/f/vI07edVR8nimBHyqimTrX8OM2IxYqlGKDH6TeJ5faC7mvZAn",
    rating: 4.97,
  },
  {
    slug: "mobile-legends-paket-irit",
    title: "Mobile Legends Paket Irit",
    publisher: "Moonton",
    cover:
      "https://sbclbzad8s.ufs.sh/f/vI07edVR8nimXy27KAbgivcQh9BdKO6FlxM7eWACLyN3uRjJ",
    banner:
      "https://sbclbzad8s.ufs.sh/f/vI07edVR8nimXy27KAbgivcQh9BdKO6FlxM7eWACLyN3uRjJ",
    rating: 4.95,
  },
  {
    slug: "pubg-mobile",
    title: "PUBG Mobile",
    publisher: "Tencent Games",
    cover:
      "https://sbclbzad8s.ufs.sh/f/vI07edVR8nim3VP6ui3nbUa9clHr8GY0jRqu34VDMgNnOtLZ",
    banner:
      "https://sbclbzad8s.ufs.sh/f/vI07edVR8nim3VP6ui3nbUa9clHr8GY0jRqu34VDMgNnOtLZ",
    rating: 4.92,
  },
  {
    slug: "free-fire",
    title: "Free Fire",
    publisher: "Garena",
    cover:
      "https://sbclbzad8s.ufs.sh/f/vI07edVR8nimRT7O5VLNMIdtETKzOgU7JuXyAepbm8GwYi19",
    banner:
      "https://sbclbzad8s.ufs.sh/f/vI07edVR8nimRT7O5VLNMIdtETKzOgU7JuXyAepbm8GwYi19",
    rating: 4.9,
  },
  // ...tambahkan game lain bila perlu
];

export function getGameBySlug(slug: string) {
  return GAMES.find((g) => g.slug === slug);
}