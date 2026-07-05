export interface Question {
  id: string;
  question: string;
  answer: string;
  mmd: string;
  surveyor: string;
  topic: string;
  order: number;
  isActive: boolean;
  tags: string[];
}