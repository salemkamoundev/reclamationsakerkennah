import { Component, inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  async logout() {
    try {
      await this.auth.logout();
      this.router.navigate(['/login']);
    } catch (e) {
      console.error("Erreur déconnexion", e);
    }
  }
}
