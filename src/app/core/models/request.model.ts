import { Timestamp } from '@angular/fire/firestore';

export type RequestCategory = 'Voirie' | 'Eclairage' | 'Déchets' | 'Sécurité' | 'Autre';

export interface Request {
  id?: string;
  title: string;
  description: string;
  category?: RequestCategory;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  lat: number;
  lng: number;
  createdAt: Timestamp | Date;
  createdBy: string;
  authorEmail?: string;
}
