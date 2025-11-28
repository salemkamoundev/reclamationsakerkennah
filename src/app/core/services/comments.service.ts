import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, where, orderBy, Timestamp, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private firestore = inject(Firestore);
  private collectionName = 'comments';

  getApprovedComments(requestId: string): Observable<Comment[]> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('requestId', '==', requestId), where('status', '==', 'approved'), orderBy('createdAt', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Comment[]>;
  }

  getPendingComments(): Observable<Comment[]> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Comment[]>;
  }

  addComment(comment: Partial<Comment>) {
    const col = collection(this.firestore, this.collectionName);
    return addDoc(col, {
      ...comment,
      status: 'pending',
      createdAt: Timestamp.now()
    });
  }

  moderateComment(id: string, status: 'approved' | 'rejected') {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(docRef, { status });
  }
}
