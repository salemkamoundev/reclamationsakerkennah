import { Component, inject } from '@angular/core';
import { RequestsService } from '../../../core/services/requests.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-requests',
  templateUrl: './admin-requests.component.html',
  standalone: false
})
export class AdminRequestsComponent {
  requestsService = inject(RequestsService);
  toast = inject(ToastService);
  
  // On ne charge que les demandes avec le statut 'pending'
  pendingRequests$ = this.requestsService.getPendingRequests();

  // Action : Valider
  async validateRequest(id: string | undefined) {
    if (!id) return;
    try {
      // Le service change le status en 'approved' -> Le signalement devient public
      await this.requestsService.updateStatus(id, 'approved');
      this.toast.show('success', 'Signalement validé et publié !');
    } catch (e) {
      console.error(e);
      this.toast.show('error', 'Erreur technique lors de la validation.');
    }
  }

  // Action : Rejeter
  async rejectRequest(id: string | undefined) {
    if (!id) return;
    if (!confirm('Voulez-vous vraiment rejeter ce signalement ? Il ne sera pas publié.')) return;
    
    try {
      await this.requestsService.updateStatus(id, 'rejected');
      this.toast.show('info', 'Signalement rejeté.');
    } catch (e) {
      console.error(e);
      this.toast.show('error', 'Erreur lors du rejet.');
    }
  }
}
