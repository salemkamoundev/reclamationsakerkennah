import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, query, where, orderBy, Timestamp, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Request } from '../models/request.model';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private firestore = inject(Firestore);
  private collectionName = 'requests';

  // Public : seulement les approuvés
  getApprovedRequests(): Observable<Request[]> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Request[]>;
  }

  // Admin : les signalements en attente
  getPendingRequests(): Observable<Request[]> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Request[]>;
  }

  // Admin : TOUT (pour les stats)
  getAllRequests(): Observable<Request[]> {
    const col = collection(this.firestore, this.collectionName);
    // Note : On trie par date pour faciliter les stats temporelles si besoin
    const q = query(col, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Request[]>;
  }

  // User : Ses propres signalements
  getUserRequests(uid: string): Observable<Request[]> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('createdBy', '==', uid), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Request[]>;
  }

  getRequestById(id: string): Observable<Request> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<Request>;
  }

  addRequest(req: Partial<Request>) {
    const col = collection(this.firestore, this.collectionName);
    return addDoc(col, {
      ...req,
      status: 'pending', 
      createdAt: Timestamp.now()
    });
  }

  updateStatus(id: string, status: 'approved' | 'rejected') {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(docRef, { status });
  }
  
  // Admin : Supprimer définitivement (optionnel, pour le nettoyage)
  deleteRequest(id: string) {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(docRef);
  }
}
