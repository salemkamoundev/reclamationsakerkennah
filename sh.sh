#!/bin/bash

echo "🚑 Réécriture propre de AppModule..."

cat << 'EOF' > src/app/app.module.ts
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';
import { RouterModule } from '@angular/router';

// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';

// Components
import { RequestListComponent } from './features/requests/request-list/request-list.component';
import { RequestDetailComponent } from './features/requests/request-detail/request-detail.component';
import { RequestCreateComponent } from './features/requests/request-create/request-create.component';
import { RequestMapComponent } from './features/requests/request-map/request-map.component';
import { LoginComponent } from './features/auth/login/login.component';
import { UserDashboardComponent } from './features/auth/user-dashboard/user-dashboard.component';
import { PendingCommentsComponent } from './features/admin/pending-comments/pending-comments.component';
import { AdminRequestsComponent } from './features/admin/admin-requests/admin-requests.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { NotFoundComponent } from './core/components/not-found/not-found.component';
import { AboutComponent } from './features/about/about.component';
import { OnboardingComponent } from './features/onboarding/onboarding.component';

@NgModule({
  declarations: [
    AppComponent,
    RequestListComponent,
    RequestDetailComponent,
    RequestCreateComponent,
    RequestMapComponent,
    LoginComponent,
    UserDashboardComponent,
    PendingCommentsComponent,
    AdminRequestsComponent,
    AdminDashboardComponent,
    ToastComponent,
    NotFoundComponent,
    AboutComponent,
    OnboardingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    UpperCasePipe,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
EOF

echo "✅ AppModule réécrit proprement."
echo "👉 Arrête et relance 'ng serve'."