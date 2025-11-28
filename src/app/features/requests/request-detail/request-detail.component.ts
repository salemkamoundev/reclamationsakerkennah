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
  styleUrls: ['./request-detail.component.css']
})
export class RequestDetailComponent {
  private route = inject(ActivatedRoute);
  private requestsService = inject(RequestsService);
  private commentsService = inject(CommentsService);
  public auth = inject(AuthService);

  // Récupération de la réclamation basée sur l'URL
  request$: Observable<Request> = this.route.paramMap.pipe(
    switchMap(params => this.requestsService.getRequestById(params.get('id')!))
  );

  // Récupération des commentaires validés
  comments$: Observable<Comment[]> = this.route.paramMap.pipe(
    switchMap(params => this.commentsService.getApprovedComments(params.get('id')!))
  );

  newCommentContent = '';

  async addComment(requestId: string) {
    if (!this.newCommentContent.trim()) return;

    // On récupère l'utilisateur connecté (snapshot unique)
    this.auth.currentUser$.pipe(take(1)).subscribe(async (user) => {
      if (!user) {
        alert("Vous devez être connecté pour commenter.");
        return;
      }

      try {
        await this.commentsService.addComment({
          requestId: requestId,
          content: this.newCommentContent,
          authorId: user.uid,
          authorEmail: user.email || 'Anonyme',
          status: 'pending', // Doit être validé par l'admin
          createdAt: new Date()
        });

        // Reset du formulaire et notification
        this.newCommentContent = '';
        alert("Votre commentaire a été envoyé ! Il sera visible après validation par un modérateur.");
      } catch (error) {
        console.error("Erreur lors de l'envoi :", error);
        alert("Une erreur est survenue.");
      }
    });
  }
}
