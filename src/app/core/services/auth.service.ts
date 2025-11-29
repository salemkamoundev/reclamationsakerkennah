import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, GoogleAuthProvider, signInWithPopup, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc, getDoc } from '@angular/fire/firestore';
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
      // Force le typage 'any'
      return docData(userDoc) as Observable<any>;
    }),
    switchMap(data => of(!!data?.isAdmin))
  );

  async login(email: string, pass: string) {
    return await signInWithEmailAndPassword(this.auth, email, pass);
  }

  // MODIFIÉ : Accepte le nom en paramètre
  async register(email: string, pass: string, name: string) {
    const creds = await createUserWithEmailAndPassword(this.auth, email, pass);
    
    // 1. Mettre à jour le profil Auth (le plus important pour les commentaires)
    if (creds.user) {
      await updateProfile(creds.user, { displayName: name });
    }

    // 2. Créer le document Firestore
    await this.createUserProfile(creds.user, name);
    
    return creds;
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const creds = await signInWithPopup(this.auth, provider);
    await this.createUserProfile(creds.user, creds.user.displayName || '');
    return creds;
  }

  async logout() {
    return await signOut(this.auth);
  }

  private async createUserProfile(user: any, name: string = '') {
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      await setDoc(userDocRef, { 
        email: user.email, 
        role: 'user', 
        createdAt: new Date(),
        displayName: name || user.displayName || '',
        photoURL: user.photoURL || ''
      });
    }
  }
}
