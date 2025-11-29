#!/bin/bash

echo "🗺️ Force l'affichage de la carte (Refresh & Dimensions)..."

# 1. Mise à jour du composant MAP (TS)
# On ajoute un setTimeout avec map.invalidateSize() pour forcer le rendu des tuiles
cat << 'EOF' > src/app/features/requests/request-map/request-map.component.ts
import { Component, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-request-map',
  template: '<div id="map" class="h-full w-full rounded-lg shadow-inner border border-slate-300 z-0"></div>',
  styles: [':host { display: block; height: 100%; width: 100%; min-height: 300px; }'], // CSS critique ajouté ici
  standalone: false
})
export class RequestMapComponent implements AfterViewInit, OnChanges {
  @Input() lat: number = 34.71;
  @Input() lng: number = 11.17;
  @Input() requests: any[] | null = null;
  @Input() readonly: boolean = true;
  @Output() coordsSelected = new EventEmitter<{lat: number, lng: number}>();

  private map!: L.Map;
  private markersLayer = L.layerGroup();

  ngAfterViewInit(): void { 
    this.initMap(); 
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) return;
    
    if (changes['lat'] || changes['lng']) this.refreshSingleMarker();
    if (changes['requests'] && this.requests) this.refreshMultipleMarkers();
    
    // Hack Leaflet : Forcer le redimensionnement si les données changent
    setTimeout(() => { this.map.invalidateSize(); }, 200);
  }

  private initMap(): void {
    const iconDefault = L.icon({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.map = L.map('map').setView([this.lat, this.lng], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: 'OSM' }).addTo(this.map);
    this.markersLayer.addTo(this.map);

    if (this.requests) this.refreshMultipleMarkers();
    else this.refreshSingleMarker();

    if (!this.readonly && !this.requests) {
      this.map.on('click', (e: any) => {
        this.lat = e.latlng.lat;
        this.lng = e.latlng.lng;
        this.refreshSingleMarker();
        this.coordsSelected.emit({ lat: this.lat, lng: this.lng });
      });
    }

    // LE FIX CRITIQUE : On attend un peu que le DOM soit dessiné, puis on force Leaflet à recalculer sa taille
    setTimeout(() => {
      this.map.invalidateSize();
    }, 500);
  }

  private refreshSingleMarker() {
    this.markersLayer.clearLayers();
    L.marker([this.lat, this.lng]).addTo(this.markersLayer);
    this.map.setView([this.lat, this.lng], 14);
  }

  private refreshMultipleMarkers() {
    this.markersLayer.clearLayers();
    if (!this.requests || this.requests.length === 0) {
        this.map.setView([34.71, 11.17], 11);
        return; 
    }
    const bounds = L.latLngBounds([]);
    this.requests.forEach(req => {
      const marker = L.marker([req.lat, req.lng]);
      const popup = '<b>' + req.title + '</b><br><a href="/requests/' + req.id + '">Voir</a>';
      marker.bindPopup(popup);
      this.markersLayer.addLayer(marker);
      bounds.extend([req.lat, req.lng]);
    });
    if (bounds.isValid()) this.map.fitBounds(bounds, { padding: [50, 50] });
  }
}
EOF

# 2. Mise à jour du template détail (HTML)
# On force une hauteur explicite via style inline pour être sûr à 100%
cat << 'EOF' > src/app/features/requests/request-detail/request-detail.component.html
<div class="max-w-5xl mx-auto" *ngIf="request$ | async as req; else loading">
  
  <div class="mb-6">
    <a routerLink="/requests" class="text-slate-500 hover:text-slate-800 text-sm mb-2 inline-block">&larr; Retour à la liste</a>
    <div class="flex justify-between items-start flex-wrap gap-2">
      <h1 class="text-3xl font-bold text-slate-900">{{ req.title }}</h1>
      <div class="flex gap-2">
        <span class="px-3 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-600 border border-slate-200">
            {{ req.category || 'Autre' }}
        </span>
        <span class="px-3 py-1 rounded-full text-sm font-bold uppercase"
           [ngClass]="{
             'bg-emerald-100 text-emerald-800': req.status === 'approved',
             'bg-yellow-100 text-yellow-800': req.status === 'pending',
             'bg-red-100 text-red-800': req.status === 'rejected'
           }">
          {{ req.status }}
        </span>
      </div>
    </div>
    <p class="text-slate-400 text-sm mt-1">Publié le {{ req.createdAt | date:'medium' }}</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    
    <div class="md:col-span-2 space-y-6">
      
      <div *ngIf="req.imageUrl" class="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700">
        <img [src]="req.imageUrl" class="w-full max-h-[400px] object-contain mx-auto" alt="Preuve photo">
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 class="font-bold text-slate-800 mb-4 border-b pb-2">Description</h3>
        <p class="text-slate-700 leading-relaxed whitespace-pre-wrap">{{ req.description }}</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 class="font-bold text-slate-800 mb-4">Localisation</h3>
        
        <div class="h-[400px] w-full rounded-lg overflow-hidden border border-slate-200 relative z-0">
            <app-request-map 
                [lat]="req.lat" 
                [lng]="req.lng" 
                [readonly]="true">
            </app-request-map>
        </div>
        
        <p class="text-xs text-slate-400 mt-2 text-right">GPS: {{req.lat | number:'1.4-4'}}, {{req.lng | number:'1.4-4'}}</p>
      </div>
    </div>

    <div class="space-y-6">
      <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 h-full flex flex-col">
        <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
          Commentaires <span class="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full" *ngIf="comments$ | async as comments">{{ comments.length }}</span>
        </h3>

        <div class="space-y-4 flex-grow overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
          <ng-container *ngFor="let comment of comments$ | async">
            <div class="bg-white p-4 rounded-lg shadow-sm text-sm border border-slate-100">
              <div class="flex justify-between items-baseline mb-2">
                <span class="font-bold text-emerald-700">
                  {{ comment.authorName || comment.authorEmail || 'Citoyen' }}
                </span>
                <span class="text-xs text-slate-400">
                  {{ comment.createdAt | date:'short' }}
                </span>
              </div>
              <p class="text-slate-700 leading-snug">{{ comment.content }}</p>
            </div>
          </ng-container>
          <div *ngIf="(comments$ | async)?.length === 0" class="text-center text-slate-400 italic py-4">
            Aucun commentaire pour le moment.
          </div>
        </div>

        <div class="mt-6 border-t border-slate-200 pt-4">
          <ng-container *ngIf="auth.currentUser$ | async; else loginToComment">
            <textarea [(ngModel)]="newCommentContent" class="w-full p-3 rounded border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm mb-2 outline-none" rows="3" placeholder="Ajouter un commentaire..."></textarea>
            <button (click)="addComment(req.id!)" [disabled]="!newCommentContent.trim() || isSubmitting" class="w-full bg-slate-900 text-white py-2 rounded text-sm hover:bg-slate-800 disabled:opacity-50 transition">
              {{ isSubmitting ? 'Envoi...' : 'Publier' }}
            </button>
          </ng-container>
          <ng-template #loginToComment>
            <p class="text-sm text-center text-slate-500 bg-white p-3 rounded border border-slate-100">
              <a routerLink="/login" class="text-emerald-600 font-bold hover:underline">Connectez-vous</a> pour participer.
            </p>
          </ng-template>
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
EOF

echo "✅ Carte forcée (Height + InvalidateSize)."
echo "👉 Rafraîchis la page."