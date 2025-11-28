#!/bin/bash

# 1. Patch du Service Requests
# On ajoute une méthode pour récupérer TOUS les signalements (pour les stats)
echo "🔧 Patch : Ajout de getAllRequests dans RequestsService..."
cat << 'EOF' > src/app/core/services/requests.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, query, where, orderBy, Timestamp, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Request } from '../models/request.model';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private firestore = inject(Firestore);
  private collectionName = 'requests';

  // Public : seulement les approuvés
  getApprovedRequests(): Observable<Request[]> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Request[]>;
  }

  // Admin : les signalements en attente
  getPendingRequests(): Observable<Request[]> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Request[]>;
  }

  // Admin : TOUT (pour les stats)
  getAllRequests(): Observable<Request[]> {
    const col = collection(this.firestore, this.collectionName);
    // Note : On trie par date pour faciliter les stats temporelles si besoin
    const q = query(col, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Request[]>;
  }

  // User : Ses propres signalements
  getUserRequests(uid: string): Observable<Request[]> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('createdBy', '==', uid), orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Request[]>;
  }

  getRequestById(id: string): Observable<Request> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(docRef, { idField: 'id' }) as Observable<Request>;
  }

  addRequest(req: Partial<Request>) {
    const col = collection(this.firestore, this.collectionName);
    return addDoc(col, {
      ...req,
      status: 'pending', 
      createdAt: Timestamp.now()
    });
  }

  updateStatus(id: string, status: 'approved' | 'rejected') {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return updateDoc(docRef, { status });
  }
  
  // Admin : Supprimer définitivement (optionnel, pour le nettoyage)
  deleteRequest(id: string) {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return deleteDoc(docRef);
  }
}
EOF

# 2. Génération du composant Admin Dashboard
echo "🔨 Génération du composant AdminDashboard..."
ng g c features/admin/admin-dashboard --module app --skip-tests

# 3. Mise à jour du Routing (Route par défaut de l'admin)
echo "🗺️ Mise à jour des routes Admin..."
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
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component'; // Import
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/requests', pathMatch: 'full' },
  { path: 'requests', component: RequestListComponent },
  { path: 'requests/new', component: RequestCreateComponent, canActivate: [authGuard] },
  { path: 'requests/:id', component: RequestDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: UserDashboardComponent, canActivate: [authGuard] },
  
  // Routes Admin
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] }, // Dashboard racine
  { path: 'admin/requests', component: AdminRequestsComponent, canActivate: [adminGuard] },
  { path: 'admin/comments', component: PendingCommentsComponent, canActivate: [adminGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
EOF

# 4. Logique (TS) Admin Dashboard
# Calcul des stats à la volée
echo "📄 Injection logique: Admin Dashboard..."
cat << 'EOF' > src/app/features/admin/admin-dashboard/admin-dashboard.component.ts
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
EOF

# 5. Design (HTML) Admin Dashboard
# Cartes KPI + Barres de progression pour les catégories
echo "🎨 Design: Admin Dashboard..."
cat << 'EOF' > src/app/features/admin/admin-dashboard/admin-dashboard.component.html
<div class="container mx-auto max-w-6xl">
  <div class="mb-8 flex justify-between items-end">
    <div>
      <h2 class="text-3xl font-bold text-slate-900">Tableau de Bord</h2>
      <p class="text-slate-500">Vue d'ensemble de l'activité sur Kerkennah.</p>
    </div>
    <div class="text-sm text-slate-400">
      Mise à jour en temps réel
    </div>
  </div>

  <div *ngIf="stats$ | async as stats; else loading">
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
          📊
        </div>
        <div>
          <div class="text-3xl font-bold text-slate-800">{{ stats.total }}</div>
          <div class="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Signalements</div>
        </div>
      </div>

      <a routerLink="/admin/requests" class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-400 hover:shadow-md transition cursor-pointer flex items-center gap-4 group">
        <div class="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition">
          📢
        </div>
        <div>
          <div class="text-3xl font-bold text-slate-800">{{ stats.pending }}</div>
          <div class="text-xs text-slate-500 uppercase font-bold tracking-wider">À Valider</div>
        </div>
      </a>

      <a routerLink="/admin/comments" class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-400 hover:shadow-md transition cursor-pointer flex items-center gap-4 group">
        <div class="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition">
          💬
        </div>
        <div>
          <div class="text-3xl font-bold text-slate-800">{{ stats.pendingCommentsCount }}</div>
          <div class="text-xs text-slate-500 uppercase font-bold tracking-wider">Commentaires</div>
        </div>
      </a>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">
          ✅
        </div>
        <div>
          <div class="text-3xl font-bold text-slate-800">{{ stats.approved }}</div>
          <div class="text-xs text-slate-500 uppercase font-bold tracking-wider">En ligne / Validés</div>
        </div>
      </div>

    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 class="font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">Répartition par Catégorie</h3>
        
        <div class="space-y-5">
          <div *ngFor="let cat of stats.categoryStats">
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium text-slate-700">{{ cat.name }}</span>
              <span class="text-slate-500">{{ cat.count }} ({{ cat.percentage }}%)</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div class="bg-indigo-600 h-2.5 rounded-full" [style.width.%]="cat.percentage"></div>
            </div>
          </div>
          
          <div *ngIf="stats.categoryStats.length === 0" class="text-center text-slate-400 italic py-4">
            Pas assez de données pour afficher les statistiques.
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-xl shadow-lg">
          <h3 class="font-bold text-lg mb-2">Administration</h3>
          <p class="text-slate-300 text-sm mb-4">Bienvenue dans l'espace de gestion. N'oubliez pas de vérifier les commentaires régulièrement pour maintenir un espace sain.</p>
          <div class="flex gap-3">
             <a routerLink="/admin/requests" class="bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-sm transition border border-white/20">
               Gérer les signalements
             </a>
             <a routerLink="/" class="bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded text-sm transition font-bold text-white">
               Voir le site public
             </a>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 class="font-bold text-slate-800 mb-4">Taux de Rejet</h3>
           <div class="flex items-center gap-4">
             <div class="text-4xl font-bold text-red-500">{{ stats.rejected }}</div>
             <div class="text-sm text-slate-500 leading-tight">
               Signalements rejetés<br>depuis le lancement.
             </div>
           </div>
        </div>
      </div>

    </div>

  </div>

  <ng-template #loading>
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
    </div>
  </ng-template>
</div>
EOF

# 6. Mise à jour du Menu Admin dans le Header
# On ajoute un lien vers le Dashboard principal
echo "🎨 Mise à jour du Header (Menu Admin)..."
# On cherche le bloc Admin existant et on l'enrichit
cat << 'EOF' > src/app/app.component.html
<div class="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-800">
  
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
        
        <ng-container *ngIf="auth.isAdmin$ | async">
          <div class="hidden md:flex items-center space-x-4 border-l border-slate-700 pl-4 ml-2">
            <span class="text-xs text-slate-500 uppercase tracking-widest font-bold">Admin</span>
            
            <a routerLink="/admin" routerLinkActive="text-orange-400" [routerLinkActiveOptions]="{exact: true}" class="hover:text-orange-300 transition flex items-center gap-1" title="Tableau de bord">
              📊
            </a>
            <a routerLink="/admin/requests" routerLinkActive="text-orange-400" class="hover:text-orange-300 transition flex items-center gap-1">
              📢 <span class="hidden lg:inline">Signalements</span>
            </a>
            <a routerLink="/admin/comments" routerLinkActive="text-orange-400" class="hover:text-orange-300 transition flex items-center gap-1">
              💬 <span class="hidden lg:inline">Avis</span>
            </a>
          </div>
        </ng-container>

        <ng-container *ngIf="auth.currentUser$ | async as user; else loginBtn">
          <div class="flex items-center space-x-4 border-l border-slate-700 pl-6">
            <button (click)="logout()" class="text-slate-300 hover:text-white transition text-xs md:text-sm">
              Déconnexion
            </button>
            
            <a routerLink="/profile" class="flex items-center gap-2 group cursor-pointer" title="Mon Espace">
              <div class="text-right hidden lg:block leading-tight">
                <div class="text-xs text-slate-400">Bonjour,</div>
                <div class="text-xs font-bold text-white group-hover:text-emerald-400 transition max-w-[100px] truncate">{{ user.email?.split('@')[0] }}</div>
              </div>
              <div class="w-8 h-8 rounded-full bg-emerald-700 group-hover:bg-emerald-600 transition flex items-center justify-center text-xs font-bold ring-2 ring-slate-800">
                {{ user.email?.charAt(0) | uppercase }}
              </div>
            </a>

          </div>
        </ng-container>
        <ng-template #loginBtn>
          <a routerLink="/login" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded transition shadow-md">
            Connexion
          </a>
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

echo "✅ Script 14 terminé ! Dashboard Admin avec statistiques installé."