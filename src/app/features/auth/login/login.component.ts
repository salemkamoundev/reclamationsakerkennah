import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
// CORRECTION : Import direct depuis le service, pas le composant
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
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async submit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    
    try {
      if (this.isRegisterMode) {
        await this.auth.register(email!, password!);
        this.toast.show('success', 'Compte créé avec succès !');
      } else {
        await this.auth.login(email!, password!);
        this.toast.show('success', 'Connexion réussie.');
      }
      this.router.navigate(['/requests']);
    } catch (err: any) {
      console.error(err);
      this.errorMsg = "Erreur : " + this.translateFirebaseError(err.code);
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
      default: return 'Une erreur est survenue.';
    }
  }
}
