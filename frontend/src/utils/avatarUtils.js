export const PLAYER_AVATARS = [
  { emoji: '🦁', name: 'Lion', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { emoji: '🦊', name: 'Fox', bg: 'linear-gradient(135deg, #f97316, #c2410c)' },
  { emoji: '🐼', name: 'Panda', bg: 'linear-gradient(135deg, #475569, #0f172a)' },
  { emoji: '🐯', name: 'Tiger', bg: 'linear-gradient(135deg, #eab308, #ca8a04)' },
  { emoji: '🦅', name: 'Eagle', bg: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  { emoji: '🐺', name: 'Wolf', bg: 'linear-gradient(135deg, #6366f1, #4338ca)' }
];

export function getPlayerAvatar(playerIndex = 0) {
  const index = Math.abs(playerIndex) % PLAYER_AVATARS.length;
  return PLAYER_AVATARS[index];
}
