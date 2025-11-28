import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginComponent } from './features/auth/login/login.component';
import { RequestListComponent } from './features/requests/request-list/request-list.component';
import { RequestDetailComponent } from './features/requests/request-detail/request-detail.component';
import { PendingCommentsComponent } from './features/admin/pending-comments/pending-comments.component';
import { RequestMapComponent } from './features/requests/request-map/request-map.component';
import { RequestCreateComponent } from './features/requests/request-create/request-create.component';
import { UserDashboardComponent } from './features/auth/user-dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { NotFoundComponent } from './core/components/not-found/not-found.component';
import { AboutComponent } from './features/about/about.component';

@NgModule({
  declarations: [
    App,
    LoginComponent,
    RequestListComponent,
    RequestDetailComponent,
    PendingCommentsComponent,
    RequestMapComponent,
    RequestCreateComponent,
    UserDashboardComponent,
    AdminDashboardComponent,
    ToastComponent,
    NotFoundComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
