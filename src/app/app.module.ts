import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage'; // AJOUT
import { environment } from '../environments/environment';

// Components (Imports automatiques via CLI normalement, mais on les réinclus pour être sûr)
import { RequestListComponent } from './features/requests/request-list/request-list.component';
import { RequestDetailComponent } from './features/requests/request-detail/request-detail.component';
import { RequestCreateComponent } from './features/requests/request-create/request-create.component';
import { RequestMapComponent } from './features/requests/request-map/request-map.component';
import { LoginComponent } from './features/auth/login/login.component';
import { UserDashboardComponent } from './features/auth/user-dashboard/user-dashboard.component';
import { PendingCommentsComponent } from './features/admin/pending-comments/pending-comments.component';
import { AdminRequestsComponent } from './features/admin/admin-requests/admin-requests.component';

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
    AdminRequestsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()) // AJOUT
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
