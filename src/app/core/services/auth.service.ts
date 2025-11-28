import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
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
      return docData(userDoc) as Observable<any>;
    }),
    switchMap(data => of(!!data?.isAdmin))
  );

  // Connexion Email/Password
  async login(email: string, pass: string) {
    return await signInWithEmailAndPassword(this.auth, email, pass);
  }

  // Inscription Email/Password
  async register(email: string, pass: string) {
    const creds = await createUserWithEmailAndPassword(this.auth, email, pass);
    await this.createUserProfile(creds.user);
    return creds;
  }

  // Connexion Google (Nouveau)
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const creds = await signInWithPopup(this.auth, provider);
    await this.createUserProfile(creds.user);
    return creds;
  }

  async logout() {
    return await signOut(this.auth);
  }

  // Helper pour créer/mettre à jour le profil user dans Firestore
  private async createUserProfile(user: any) {
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    const userSnapshot = await getDoc(userDocRef);

    // Si l'utilisateur n'existe pas encore dans Firestore, on le crée
    if (!userSnapshot.exists()) {
      await setDoc(userDocRef, { 
        email: user.email, 
        role: 'user', 
        createdAt: new Date(),
        displayName: user.displayName || '',
        photoURL: user.photoURL || ''
      });
    }
  }
}
