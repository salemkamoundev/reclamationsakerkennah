import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { RequestsService } from '../../../core/services/requests.service';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent {
  auth = inject(AuthService);
  requestsService = inject(RequestsService);

  // On switchMap depuis l'utilisateur connecté vers ses requêtes
  myRequests$ = this.auth.currentUser$.pipe(
    switchMap(user => {
      if (!user) return of([]);
      return this.requestsService.getUserRequests(user.uid);
    })
  );
}
