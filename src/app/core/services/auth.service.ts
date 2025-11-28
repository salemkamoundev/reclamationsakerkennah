import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  
  currentUser$ = user(this.auth);

  isAdmin$: Observable<boolean> = this.currentUser$.pipe(
    switchMap(user => {
      if (!user) return of(false);
      const userDoc = doc(this.firestore, `users/${user.uid}`);
      // Force le typage 'any' pour éviter les conflits TypeScript stricts
      return docData(userDoc) as Observable<any>;
    }),
    switchMap(data => of(!!data?.isAdmin))
  );

  async register(email: string, pass: string) {
    const creds = await createUserWithEmailAndPassword(this.auth, email, pass);
    const userDoc = doc(this.firestore, `users/${creds.user.uid}`);
    await setDoc(userDoc, { email, role: 'user', createdAt: new Date() });
    return creds;
  }

  async login(email: string, pass: string) {
    return await signInWithEmailAndPassword(this.auth, email, pass);
  }

  async logout() {
    return await signOut(this.auth);
  }
}
