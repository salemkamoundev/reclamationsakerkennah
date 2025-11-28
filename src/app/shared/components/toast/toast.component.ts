import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3">
      <div *ngFor="let toast of toastService.toasts$ | async" 
           class="min-w-[300px] p-4 rounded-lg shadow-lg border-l-4 text-white transform transition-all animate-slide-in flex justify-between items-center"
           [ngClass]="{
             'bg-slate-800 border-emerald-500': toast.type === 'success',
             'bg-slate-800 border-red-500': toast.type === 'error',
             'bg-slate-800 border-blue-500': toast.type === 'info'
           }">
        <div class="flex items-center gap-3">
          <span class="text-xl">
            {{ toast.type === 'success' ? '✅' : (toast.type === 'error' ? '❌' : 'ℹ️') }}
          </span>
          <p class="text-sm font-medium">{{ toast.message }}</p>
        </div>
        <button (click)="toastService.remove(toast.id)" class="text-slate-400 hover:text-white ml-4">✕</button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out forwards;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
