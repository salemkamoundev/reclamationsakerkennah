import { Component, inject } from '@angular/core';
import { CommentsService } from '../../../core/services/comments.service';

@Component({
  selector: 'app-pending-comments',
  templateUrl: './pending-comments.component.html',
  styleUrls: ['./pending-comments.component.css']
})
export class PendingCommentsComponent {
  commentsService = inject(CommentsService);
  pendingComments$ = this.commentsService.getPendingComments();

  async moderate(id: string | undefined, status: 'approved' | 'rejected') {
    if(!id) return;
    await this.commentsService.moderateComment(id, status);
  }
}
