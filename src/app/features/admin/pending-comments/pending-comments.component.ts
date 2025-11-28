import { Component, inject } from '@angular/core';
import { CommentsService } from '../../../core/services/comments.service';

@Component({
  selector: 'app-pending-comments',
  templateUrl: './pending-comments.component.html',
  standalone: false
})
export class PendingCommentsComponent {
  commentsService = inject(CommentsService);
  pendingComments$ = this.commentsService.getPendingComments();

  async moderate(id: string | undefined, status: any) {
    if(id) await this.commentsService.moderateComment(id, status);
  }
}
