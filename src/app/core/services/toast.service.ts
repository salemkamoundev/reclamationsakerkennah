import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts$ = new BehaviorSubject<Toast[]>([]);
  private counter = 0;

  show(type: 'success' | 'error' | 'info', message: string, duration = 3000) {
    const id = this.counter++;
    const newToast: Toast = { id, type, message };
    
    // Ajout à la liste
    const current = this.toasts$.value;
    this.toasts$.next([...current, newToast]);

    // Suppression auto
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: number) {
    const current = this.toasts$.value;
    this.toasts$.next(current.filter(t => t.id !== id));
  }
}
