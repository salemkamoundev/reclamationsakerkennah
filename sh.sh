#!/bin/bash

echo "🚑 Correction du format de Date et des Permissions..."

# 1. Correction de RequestsService (Conversion Timestamp -> Date)
# On ajoute un 'pipe(map())' pour transformer les données brutes de Firebase
echo "🔧 Mise à jour de src/app/core/services/requests.service.ts..."
cat << 'EOF' > src/app/core/services/requests.service.ts
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
EOF

# 2. Correction de CommentsService (Même problème de Date)
echo "🔧 Mise à jour de src/app/core/services/comments.service.ts..."
cat << 'EOF' > src/app/core/services/comments.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, where, orderBy, Timestamp, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Comment } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private firestore = inject(Firestore);
  private collectionName = 'comments';

  private convertTimestamps(c: any): Comment {
    if (c.createdAt && typeof c.createdAt.toDate === 'function') {
      c.createdAt = c.createdAt.toDate();
    }
    return c as Comment;
  }

  getApprovedComments(requestId: string): Observable<Comment[]> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('requestId', '==', requestId), where('status', '==', 'approved'), orderBy('createdAt', 'asc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map(comments => comments.map(c => this.convertTimestamps(c)))
    );
  }

  getPendingComments(): Observable<Comment[]> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map(comments => comments.map(c => this.convertTimestamps(c)))
    );
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
EOF

# 3. Assouplissement des règles de sécurité (Pour le Seeder et le Dev)
# On permet temporairement l'écriture pour tout le monde pour débloquer le Seeder
echo "🔓 Ouverture temporaire des règles Firestore..."
cat << 'EOF' > firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // EN DEVELOPPEMENT : On autorise tout le monde à lire et écrire
      // ATTENTION : À remettre en sécurisé avant la mise en production réelle
      allow read, write: if true;
    }
  }
}
EOF

echo "✅ Corrections appliquées."
echo "👉 Le serveur devrait se recharger."
echo "1. Clique à nouveau sur 'Générer des données de démo'."
echo "2. Les dates devraient s'afficher correctement (ex: '28 nov. 2025')."