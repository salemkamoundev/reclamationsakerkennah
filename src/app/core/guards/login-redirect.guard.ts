import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, tap } from 'rxjs/operators';

export const loginRedirectGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  return auth.currentUser$.pipe(
    take(1),
    map(user => !user), // Si user existe (true), map renvoie false (bloque l'accès)
    tap(canAccess => {
      if (!canAccess) {
        // Si l'utilisateur est déjà connecté, on le renvoie vers l'accueil
        router.navigate(['/requests']);
      }
    })
  );
};
