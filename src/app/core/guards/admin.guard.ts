import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, tap } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAdmin$.pipe(
    take(1),
    tap(isAdmin => {
      if (!isAdmin) router.navigate(['/']);
    })
  );
};
