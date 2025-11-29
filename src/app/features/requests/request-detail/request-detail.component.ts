import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RequestsService } from '../../../core/services/requests.service';
import { CommentsService } from '../../../core/services/comments.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
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
  private toast = inject(ToastService);

  request$: Observable<Request> = this.route.paramMap.pipe(
    switchMap(params => this.requestsService.getRequestById(params.get('id')!))
  );

  comments$: Observable<Comment[]> = this.route.paramMap.pipe(
    switchMap(params => this.commentsService.getApprovedComments(params.get('id')!))
  );

  newCommentContent = '';
  isSubmitting = false;

  async addComment(requestId: string) {
    if (!this.newCommentContent.trim()) return;
    
    this.isSubmitting = true;

    this.auth.currentUser$.pipe(take(1)).subscribe(async (user: any) => {
      if (!user) {
        this.toast.show('error', 'Vous devez être connecté.');
        this.isSubmitting = false;
        return;
      }

      // On détermine le nom à afficher (Nom Google ou partie de l'email)
      const displayName = user.displayName || user.email.split('@')[0];

      try {
        await this.commentsService.addComment({
          requestId: requestId,
          content: this.newCommentContent,
          authorId: user.uid,
          authorEmail: user.email || 'Anonyme',
          authorName: displayName, // Sauvegarde du nom
          status: 'pending',
          createdAt: new Date()
        });

        this.toast.show('success', 'Commentaire envoyé ! Il sera visible après validation.');
        this.newCommentContent = '';
      } catch (error) {
        console.error(error);
        this.toast.show('error', 'Erreur lors de l\'envoi.');
      } finally {
        this.isSubmitting = false;
      }
    });
  }
}
