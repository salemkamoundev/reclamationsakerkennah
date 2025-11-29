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
