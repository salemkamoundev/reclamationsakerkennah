#!/bin/bash

# 1. Création du Service de Toast
echo "🔔 Création du ToastService..."
mkdir -p src/app/core/services
cat << 'EOF' > src/app/core/services/toast.service.ts
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
EOF

# 2. Création du Composant Toast (Visuel)
echo "🎨 Création du composant Toast..."
ng g c shared/components/toast --module app --skip-tests

echo "📄 Logique Toast Component..."
cat << 'EOF' > src/app/shared/components/toast/toast.component.ts
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
EOF

# 3. Ajout du ToastComponent dans AppComponent
# Pour qu'il soit disponible partout dans l'application
echo "🔌 Injection du Toast dans AppComponent..."
cat << 'EOF' > src/app/app.component.html
<div class="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-800">
  
  <app-toast></app-toast>

  <header class="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <a routerLink="/" class="flex items-center space-x-3 group">
        <div class="w-10 h-10 bg-emerald-500 text-white flex items-center justify-center font-bold text-lg rounded group-hover:bg-emerald-400 transition">
          RK
        </div>
        <div>
          <h1 class="font-bold text-lg leading-tight">Réclamations<br/><span class="text-slate-400 text-sm font-normal">Kerkennah</span></h1>
        </div>
      </a>

      <nav class="flex items-center space-x-6 text-sm font-medium">
        <a routerLink="/requests" routerLinkActive="text-emerald-400" [routerLinkActiveOptions]="{exact: true}" class="hover:text-emerald-400 transition">
          Signalements
        </a>
        <a routerLink="/about" routerLinkActive="text-emerald-400" class="hover:text-emerald-400 transition hidden md:block">
          À propos
        </a>
        
        <ng-container *ngIf="auth.isAdmin$ | async">
          <div class="hidden md:flex items-center space-x-4 border-l border-slate-700 pl-4 ml-2">
            <span class="text-xs text-slate-500 uppercase tracking-widest font-bold">Admin</span>
            <a routerLink="/admin" routerLinkActive="text-orange-400" [routerLinkActiveOptions]="{exact: true}" class="hover:text-orange-300 transition flex items-center gap-1">📊</a>
            <a routerLink="/admin/requests" routerLinkActive="text-orange-400" class="hover:text-orange-300 transition flex items-center gap-1">📢</a>
            <a routerLink="/admin/comments" routerLinkActive="text-orange-400" class="hover:text-orange-300 transition flex items-center gap-1">💬</a>
          </div>
        </ng-container>

        <ng-container *ngIf="auth.currentUser$ | async as user; else loginBtn">
          <div class="flex items-center space-x-4 border-l border-slate-700 pl-6">
            <button (click)="logout()" class="text-slate-300 hover:text-white transition text-xs md:text-sm">Déconnexion</button>
            <a routerLink="/profile" class="flex items-center gap-2 group cursor-pointer" title="Mon Espace">
              <div class="w-8 h-8 rounded-full bg-emerald-700 group-hover:bg-emerald-600 transition flex items-center justify-center text-xs font-bold ring-2 ring-slate-800">
                {{ user.email?.charAt(0) | uppercase }}
              </div>
            </a>
          </div>
        </ng-container>
        <ng-template #loginBtn>
          <a routerLink="/login" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded transition shadow-md">Connexion</a>
        </ng-template>
      </nav>
    </div>
  </header>

  <main class="flex-grow container mx-auto px-4 py-8">
    <router-outlet></router-outlet>
  </main>

  <footer class="bg-slate-900 text-slate-500 py-6 mt-auto">
    <div class="container mx-auto px-4 text-center text-sm">
      <p>&copy; 2025 Reclamations Kerkennah. Une initiative citoyenne.</p>
    </div>
  </footer>
</div>
EOF

# 4. Création de la Page 404
echo "🔨 Création de NotFoundComponent..."
ng g c core/components/not-found --module app --skip-tests

echo "🎨 Design: 404..."
cat << 'EOF' > src/app/core/components/not-found/not-found.component.html
<div class="flex flex-col items-center justify-center min-h-[60vh] text-center">
  <div class="text-9xl font-bold text-slate-200 mb-4">404</div>
  <h2 class="text-3xl font-bold text-slate-800 mb-2">Oups ! Page introuvable.</h2>
  <p class="text-slate-500 mb-8 max-w-md">
    Il semble que vous vous soyez perdu dans l'archipel. Cette page n'existe pas ou a été déplacée.
  </p>
  <a routerLink="/" class="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold shadow-md transition">
    Retourner à l'accueil
  </a>
</div>
EOF

# 5. Création de la Page À Propos
echo "🔨 Création de AboutComponent..."
ng g c features/about --module app --skip-tests

echo "🎨 Design: About..."
cat << 'EOF' > src/app/features/about/about.component.html
<div class="max-w-3xl mx-auto">
  <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
    <h1 class="text-3xl font-bold text-slate-900 mb-6">À propos de <span class="text-emerald-600">Reclamations Kerkennah</span></h1>
    
    <div class="prose prose-slate max-w-none text-slate-600 space-y-4">
      <p>
        Bienvenue sur la plateforme citoyenne dédiée à l'amélioration de la vie quotidienne sur l'archipel de Kerkennah.
      </p>
      
      <h3 class="text-xl font-bold text-slate-800 mt-6">Notre Mission</h3>
      <p>
        Ce projet a pour but de faciliter la communication entre les citoyens et les services techniques. 
        En signalant rapidement les problèmes (nids de poule, éclairage défaillant, dépôt sauvage), vous permettez une intervention plus efficace.
      </p>

      <h3 class="text-xl font-bold text-slate-800 mt-6">Comment ça marche ?</h3>
      <ul class="list-disc pl-5 space-y-2">
        <li><strong>Signalez :</strong> Prenez une photo, géolocalisez le problème et décrivez-le.</li>
        <li><strong>Suivez :</strong> Voyez le statut de votre demande passer de "En attente" à "Validé".</li>
        <li><strong>Participez :</strong> Commentez les signalements des autres citoyens pour apporter des précisions.</li>
      </ul>

      <h3 class="text-xl font-bold text-slate-800 mt-6">Contact</h3>
      <p>
        Cette application est une démonstration technique. Pour toute question, contactez l'administrateur à <a href="mailto:admin@kerkennah.tn" class="text-blue-600 hover:underline">admin@kerkennah.tn</a>.
      </p>
    </div>

    <div class="mt-8 pt-8 border-t border-slate-100 flex justify-center">
      <a routerLink="/requests" class="text-emerald-600 font-bold hover:underline">Voir les signalements en cours &rarr;</a>
    </div>
  </div>
</div>
EOF

# 6. Mise à jour du Routing (Wildcard + About)
echo "🗺️ Mise à jour des routes (404 & About)..."
cat << 'EOF' > src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestListComponent } from './features/requests/request-list/request-list.component';
import { RequestDetailComponent } from './features/requests/request-detail/request-detail.component';
import { RequestCreateComponent } from './features/requests/request-create/request-create.component';
import { LoginComponent } from './features/auth/login/login.component';
import { UserDashboardComponent } from './features/auth/user-dashboard/user-dashboard.component';
import { PendingCommentsComponent } from './features/admin/pending-comments/pending-comments.component';
import { AdminRequestsComponent } from './features/admin/admin-requests/admin-requests.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { AboutComponent } from './features/about/about.component';
import { NotFoundComponent } from './core/components/not-found/not-found.component';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/requests', pathMatch: 'full' },
  { path: 'requests', component: RequestListComponent },
  { path: 'requests/new', component: RequestCreateComponent, canActivate: [authGuard] },
  { path: 'requests/:id', component: RequestDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: UserDashboardComponent, canActivate: [authGuard] },
  { path: 'about', component: AboutComponent },
  
  // Admin
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/requests', component: AdminRequestsComponent, canActivate: [adminGuard] },
  { path: 'admin/comments', component: PendingCommentsComponent, canActivate: [adminGuard] },

  // Wildcard (404) - Toujours en dernier !
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
EOF

# 7. EXEMPLE : Utilisation du Toast dans RequestCreate
# On remplace l'alerte moche par notre beau toast
echo "🔧 Mise à jour RequestCreate pour utiliser ToastService..."
cat << 'EOF' > src/app/features/requests/request-create/request-create.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestsService } from '../../../core/services/requests.service';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { ToastService } from '../../../core/services/toast.service'; // Import
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
  toast = inject(ToastService); // Inject
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
        if (this.selectedFile) {
          imageUrl = await this.storage.uploadFile(this.selectedFile);
        }

        await this.requestsService.addRequest({
          title: this.form.value.title!,
          description: this.form.value.description!,
          category: this.form.value.category as RequestCategory,
          lat: this.selectedLat,
          lng: this.selectedLng,
          imageUrl: imageUrl,
          createdBy: user.uid,
          authorEmail: user.email || 'Anonyme',
          status: 'pending',
          createdAt: new Date()
        });

        // Utilisation du Toast
        this.toast.show('success', 'Signalement envoyé avec succès ! Il sera validé par un modérateur.');
        
        this.router.navigate(['/requests']);
      } catch (err) {
        console.error(err);
        this.toast.show('error', 'Une erreur est survenue lors de l\'envoi.');
        this.isSubmitting = false;
      }
    });
  }
}
EOF

echo "✅ Script 15 terminé ! UX améliorée avec Toasts et 404."