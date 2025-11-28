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
import { loginRedirectGuard } from './core/guards/login-redirect.guard'; // Import

const routes: Routes = [
  { path: '', redirectTo: '/requests', pathMatch: 'full' },
  { path: 'requests', component: RequestListComponent },
  { path: 'requests/new', component: RequestCreateComponent, canActivate: [authGuard] },
  { path: 'requests/:id', component: RequestDetailComponent },
  
  // Application du guard : Si connecté, impossible d'aller sur /login
  { path: 'login', component: LoginComponent, canActivate: [loginRedirectGuard] },
  
  { path: 'profile', component: UserDashboardComponent, canActivate: [authGuard] },
  { path: 'about', component: AboutComponent },
  
  // Admin
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/requests', component: AdminRequestsComponent, canActivate: [adminGuard] },
  { path: 'admin/comments', component: PendingCommentsComponent, canActivate: [adminGuard] },

  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
