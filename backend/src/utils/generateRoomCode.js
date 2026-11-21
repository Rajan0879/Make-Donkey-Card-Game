import { customAlphabet } from 'nanoid';

// Readability alphabet omitting ambiguous characters (0, O, 1, I, L)
const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 6);

export function generateRoomCode() {
  return nanoid();
}
