export type Message = {
  id: number | string; // Make sure this is "number | string"
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
  chatId: number;
  audioUrl?: string | null; // Make it optional and allow null
};

export type ChatSession = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  createdById: string;
}; 