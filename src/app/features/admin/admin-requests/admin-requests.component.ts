import { Component, inject } from '@angular/core';
import { RequestsService } from '../../../core/services/requests.service';

@Component({
  selector: 'app-admin-requests',
  templateUrl: './admin-requests.component.html',
  standalone: false
})
export class AdminRequestsComponent {
  requestsService = inject(RequestsService);
  pendingRequests$ = this.requestsService.getPendingRequests();

  async moderate(id: string | undefined, status: any) {
    if(id && confirm('Confirmer cette action ?')) {
      await this.requestsService.updateStatus(id, status);
    }
  }
}
