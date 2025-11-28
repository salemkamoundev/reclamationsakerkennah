import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, query, where, orderBy, Timestamp, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from '../models/request.model';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private firestore = inject(Firestore);
  private collectionName = 'requests';

  // Helper pour convertir les Timestamps Firebase en Date JS
  private convertTimestamps(req: any): Request {
    if (req.createdAt && typeof req.createdAt.toDate === 'function') {
      req.createdAt = req.createdAt.toDate();
    }
    return req as Request;
  }

  getApprovedRequests(): Observable<Request[]> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map(requests => requests.map(r => this.convertTimestamps(r)))
    );
  }

  getPendingRequests(): Observable<Request[]> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map(requests => requests.map(r => this.convertTimestamps(r)))
    );
  }

  getAllRequests(): Observable<Request[]> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map(requests => requests.map(r => this.convertTimestamps(r)))
    );
  }

  getUserRequests(uid: string): Observable<Request[]> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('createdBy', '==', uid), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map(requests => requests.map(r => this.convertTimestamps(r)))
    );
  }

  getRequestById(id: string): Observable<Request> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(docRef, { idField: 'id' }).pipe(
      map(r => this.convertTimestamps(r))
    );
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
  
  deleteRequest(id: string) {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(docRef);
  }
}
