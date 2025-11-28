import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3">
      <div *ngFor="let toast of toastService.toasts$ | async" 
           class="min-w-[300px] p-4 rounded-lg shadow-lg border-l-4 text-white bg-slate-800 flex justify-between items-center"
           [class.border-emerald-500]="toast.type === 'success'"
           [class.border-red-500]="toast.type === 'error'">
        <div class="flex items-center gap-3">
          <span>{{ toast.type === 'success' ? '✅' : '❌' }}</span>
          <p class="text-sm font-medium">{{ toast.message }}</p>
        </div>
        <button (click)="toastService.remove(toast.id)" class="ml-4">✕</button>
      </div>
    </div>
  `,
  standalone: false
})
export class ToastComponent {
  toastService = inject(ToastService);
}
