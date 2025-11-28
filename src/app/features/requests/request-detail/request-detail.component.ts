import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RequestsService } from '../../../core/services/requests.service';
import { CommentsService } from '../../../core/services/comments.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, switchMap, take } from 'rxjs';
import { Request } from '../../../core/models/request.model';
import { Comment } from '../../../core/models/comment.model';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.component.html',
  standalone: false
})
export class RequestDetailComponent {
  private route = inject(ActivatedRoute);
  private requestsService = inject(RequestsService);
  private commentsService = inject(CommentsService);
  public auth = inject(AuthService);

  request$: Observable<any> = this.route.paramMap.pipe(
    switchMap(params => this.requestsService.getRequestById(params.get('id')!))
  );

  comments$: Observable<any[]> = this.route.paramMap.pipe(
    switchMap(params => this.commentsService.getApprovedComments(params.get('id')!))
  );

  newCommentContent = '';

  async addComment(requestId: string) {
    if (!this.newCommentContent.trim()) return;
    this.auth.currentUser$.pipe(take(1)).subscribe(async (user: any) => {
      if (!user) return;
      try {
        await this.commentsService.addComment({
          requestId: requestId,
          content: this.newCommentContent,
          authorId: user.uid,
          authorEmail: user.email || 'Anonyme',
          status: 'pending',
          createdAt: new Date()
        });
        this.newCommentContent = '';
      } catch (error) { console.error(error); }
    });
  }
}
