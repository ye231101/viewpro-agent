export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  status: 'available' | 'unavailable';
}

export interface ChatMessage {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: number;
}
