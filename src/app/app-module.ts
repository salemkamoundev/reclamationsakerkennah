import { NgModule, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
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
import { ServiceWorkerModule } from '@angular/service-worker';

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
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
