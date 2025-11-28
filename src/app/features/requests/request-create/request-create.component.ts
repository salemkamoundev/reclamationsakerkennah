import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestsService } from '../../../core/services/requests.service';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { take } from 'rxjs';
import { RequestCategory } from '../../../core/models/request.model';

@Component({
  selector: 'app-request-create',
  templateUrl: './request-create.component.html',
  styleUrls: ['./request-create.component.css']
})
export class RequestCreateComponent {
  fb = inject(FormBuilder);
  requestsService = inject(RequestsService);
  auth = inject(AuthService);
  storage = inject(StorageService);
  router = inject(Router);

  categories: RequestCategory[] = ['Voirie', 'Eclairage', 'Déchets', 'Sécurité', 'Autre'];
  selectedLat = 34.71;
  selectedLng = 11.17;
  
  isSubmitting = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    category: ['Voirie', [Validators.required]]
  });

  updateCoords(event: {lat: number, lng: number}) {
    this.selectedLat = event.lat;
    this.selectedLng = event.lng;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Créer une preview locale
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.isSubmitting = true;

    this.auth.currentUser$.pipe(take(1)).subscribe(async (user) => {
      if (!user) return;
      try {
        let imageUrl = '';
        
        // 1. Upload de l'image si présente
        if (this.selectedFile) {
          imageUrl = await this.storage.uploadFile(this.selectedFile);
        }

        // 2. Sauvegarde Firestore
        await this.requestsService.addRequest({
          title: this.form.value.title!,
          description: this.form.value.description!,
          category: this.form.value.category as RequestCategory,
          lat: this.selectedLat,
          lng: this.selectedLng,
          imageUrl: imageUrl, // Ajout de l'URL
          createdBy: user.uid,
          authorEmail: user.email || 'Anonyme',
          status: 'pending',
          createdAt: new Date()
        });

        this.router.navigate(['/requests']);
      } catch (err) {
        console.error(err);
        alert("Erreur lors de l'envoi.");
        this.isSubmitting = false;
      }
    });
  }
}
