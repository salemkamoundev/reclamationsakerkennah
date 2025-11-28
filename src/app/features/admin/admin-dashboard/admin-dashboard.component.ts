import { Component, inject } from '@angular/core';
import { RequestsService } from '../../../core/services/requests.service';
import { CommentsService } from '../../../core/services/comments.service';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  standalone: false
})
export class AdminDashboardComponent {
  private reqService = inject(RequestsService);
  private comService = inject(CommentsService);

  stats$ = combineLatest([
    this.reqService.getAllRequests(),
    this.comService.getPendingComments()
  ]).pipe(
    map(([requests, pendingComments]) => {
      const total = requests.length;
      const pending = requests.filter((r: any) => r.status === 'pending').length;
      const approved = requests.filter((r: any) => r.status === 'approved').length;
      const rejected = requests.filter((r: any) => r.status === 'rejected').length;
      
      const categories: any = {};
      requests.forEach((r: any) => {
        const cat = r.category || 'Autre';
        categories[cat] = (categories[cat] || 0) + 1;
      });

      const categoryStats = Object.keys(categories)
        .map(key => ({ name: key, count: categories[key], percentage: Math.round((categories[key] / total) * 100) }))
        .sort((a, b) => b.count - a.count);

      return { total, pending, approved, rejected, categoryStats, pendingCommentsCount: pendingComments.length };
    })
  );
}
