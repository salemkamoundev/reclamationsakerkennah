import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);
  
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
      } else {
        await this.auth.login(email!, password!);
      }
      this.router.navigate(['/requests']);
    } catch (err: any) {
      console.error(err);
      this.errorMsg = "Erreur : " + err.message;
    }
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMsg = '';
  }
}
