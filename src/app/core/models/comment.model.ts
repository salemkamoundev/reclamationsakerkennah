import { Timestamp } from '@angular/fire/firestore';

export interface Comment {
  id?: string;
  requestId: string;
  content: string;
  authorId: string;
  authorEmail?: string;
  authorName?: string; // Nouveau champ
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp | Date;
}
