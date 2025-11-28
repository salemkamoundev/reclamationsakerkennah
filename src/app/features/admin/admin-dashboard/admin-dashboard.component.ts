import { Component, inject } from '@angular/core';
import { RequestsService } from '../../../core/services/requests.service';
import { CommentsService } from '../../../core/services/comments.service';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  private reqService = inject(RequestsService);
  private comService = inject(CommentsService);

  // Vue Model combiné
  stats$ = combineLatest([
    this.reqService.getAllRequests(),
    this.comService.getPendingComments()
  ]).pipe(
    map(([requests, pendingComments]) => {
      
      // 1. Compteurs de base
      const total = requests.length;
      const pending = requests.filter(r => r.status === 'pending').length;
      const approved = requests.filter(r => r.status === 'approved').length;
      const rejected = requests.filter(r => r.status === 'rejected').length;

      // 2. Stats par Catégorie
      const categories: {[key: string]: number} = {};
      requests.forEach(r => {
        const cat = r.category || 'Autre';
        categories[cat] = (categories[cat] || 0) + 1;
      });

      // 3. Transformation pour affichage (trié par nombre décroissant)
      const categoryStats = Object.keys(categories)
        .map(key => ({ name: key, count: categories[key], percentage: Math.round((categories[key] / total) * 100) }))
        .sort((a, b) => b.count - a.count);

      return {
        total,
        pending,
        approved,
        rejected,
        categoryStats,
        pendingCommentsCount: pendingComments.length
      };
    })
  );
}
