import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { RequestsService } from '../../../core/services/requests.service';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  standalone: false
})
export class UserDashboardComponent {
  auth = inject(AuthService);
  requestsService = inject(RequestsService);

  myRequests$ = this.auth.currentUser$.pipe(
    switchMap((user: any) => {
      if (!user) return of([]);
      return this.requestsService.getUserRequests(user.uid);
    })
  );
}
