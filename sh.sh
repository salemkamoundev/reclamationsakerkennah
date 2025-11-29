#!/bin/bash

echo "👤 Ajout du champ 'Nom' à l'inscription..."

# 1. Mise à jour de AuthService
# On modifie la méthode register pour accepter un nom et utiliser updateProfile
echo "🔧 Mise à jour de AuthService..."
cat << 'EOF' > src/app/core/services/auth.service.ts
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
EOF

# 2. Mise à jour de Login Component (TS)
# On gère le champ 'name' dans le formulaire
echo "📄 Mise à jour de Login.ts..."
cat << 'EOF' > src/app/features/auth/login/login.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false
})
export class LoginComponent {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);
  toast = inject(ToastService);
  
  isRegisterMode = false;
  errorMsg = '';

  form = this.fb.group({
    name: [''], // Champ optionnel au départ
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async submit() {
    // Validation personnalisée : Le nom est requis SEULEMENT en mode inscription
    if (this.isRegisterMode && !this.form.value.name) {
      this.errorMsg = "Le nom est obligatoire pour l'inscription.";
      return;
    }

    if (this.form.invalid) return;
    
    const { email, password, name } = this.form.value;
    
    try {
      if (this.isRegisterMode) {
        // On passe le nom
        await this.auth.register(email!, password!, name!);
        this.toast.show('success', 'Bienvenue ' + name + ' !');
      } else {
        await this.auth.login(email!, password!);
        this.toast.show('success', 'Connexion réussie.');
      }
      this.router.navigate(['/requests']);
    } catch (err: any) {
      console.error(err);
      this.errorMsg = this.translateFirebaseError(err.code);
    }
  }

  async loginGoogle() {
    try {
      await this.auth.loginWithGoogle();
      this.toast.show('success', 'Connecté avec Google !');
      this.router.navigate(['/requests']);
    } catch (err: any) {
      console.error(err);
      this.errorMsg = "Erreur Google : " + err.message;
    }
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMsg = '';
  }

  private translateFirebaseError(code: string): string {
    switch (code) {
      case 'auth/invalid-credential': return 'Email ou mot de passe incorrect.';
      case 'auth/email-already-in-use': return 'Cet email est déjà utilisé.';
      case 'auth/weak-password': return 'Le mot de passe est trop faible.';
      default: return 'Une erreur est survenue (' + code + ')';
    }
  }
}
EOF

# 3. Mise à jour de Login Template (HTML)
# Ajout de l'input Nom visible avec *ngIf="isRegisterMode"
echo "🎨 Mise à jour de Login.html..."
cat << 'EOF' > src/app/features/auth/login/login.component.html
<div class="flex justify-center items-center min-h-[70vh]">
  <div class="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-100">
    
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-slate-800">
        {{ isRegisterMode ? 'Créer un compte' : 'Bon retour' }}
      </h2>
      <p class="text-slate-500 text-sm mt-1">
        {{ isRegisterMode ? 'Rejoignez la communauté de Kerkennah.' : 'Connectez-vous pour continuer.' }}
      </p>
    </div>

    <div *ngIf="errorMsg" class="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100 flex items-center gap-2">
      <span>⚠️</span> {{ errorMsg }}
    </div>

    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      
      <div *ngIf="isRegisterMode" class="animate-fade-in">
        <label class="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
        <input type="text" formControlName="name" 
          class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition bg-slate-50 focus:bg-white"
          placeholder="Ex: Salem Kammoun">
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input type="email" formControlName="email" 
          class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition bg-slate-50 focus:bg-white"
          placeholder="exemple@kerkennah.tn">
      </div>
      
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
        <input type="password" formControlName="password" 
          class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition bg-slate-50 focus:bg-white"
          placeholder="••••••">
      </div>

      <button type="submit" 
        [disabled]="form.invalid"
        class="w-full bg-slate-900 text-white py-2.5 rounded-lg hover:bg-emerald-600 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
        {{ isRegisterMode ? "S'inscrire" : "Se connecter" }}
      </button>
    </form>

    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
      <div class="relative flex justify-center text-sm"><span class="px-2 bg-white text-slate-500">Ou</span></div>
    </div>

    <button (click)="loginGoogle()" type="button" class="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-2.5 rounded-lg transition shadow-sm">
      <span class="text-lg">G</span> Continuer avec Google
    </button>

    <div class="mt-6 text-center text-sm text-slate-600">
      {{ isRegisterMode ? 'Déjà un compte ?' : 'Pas encore de compte ?' }}
      <button (click)="toggleMode()" class="text-emerald-600 font-bold hover:underline ml-1">
        {{ isRegisterMode ? 'Connectez-vous' : 'Inscrivez-vous' }}
      </button>
    </div>
  </div>
</div>
EOF

echo "✅ Champ Nom ajouté."
echo "⚠️  IMPORTANT : Cela ne changera pas les ANCIENS commentaires."
echo "👉 Pour tester : Déconnecte-toi, clique sur 'S'inscrire', remplis le Nom, et poste un nouveau commentaire."