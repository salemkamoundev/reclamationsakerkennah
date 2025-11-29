#!/bin/bash

echo "🗺️ Amélioration des popups de la carte (Image + Description)..."

# On réécrit le composant pour inclure un HTML plus riche dans bindPopup()
cat << 'EOF' > src/app/features/requests/request-map/request-map.component.ts
import { Component, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-request-map',
  template: '<div id="map" class="h-full w-full rounded-lg shadow-inner border border-slate-300 z-0"></div>',
  styles: [':host { display: block; height: 100%; width: 100%; min-height: 300px; }'],
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

    setTimeout(() => { this.map.invalidateSize(); }, 500);
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
      
      // --- CONSTRUCTION DU POPUP RICHE ---
      
      // 1. Image (si existe)
      let imgHtml = '';
      if (req.imageUrl) {
        imgHtml = '<img src="' + req.imageUrl + '" style="width:100%; height:100px; object-fit:cover; border-radius: 4px; margin-bottom: 8px;">';
      }

      // 2. Description (Tronquée à 60 caractères)
      let desc = req.description || '';
      if (desc.length > 60) {
        desc = desc.substring(0, 60) + '...';
      }

      // 3. Assemblage HTML (Inline styles obligatoires pour Leaflet)
      const popupContent = 
        '<div style="width: 200px; text-align: left;">' +
           imgHtml +
           '<h3 style="font-weight: bold; margin: 0 0 4px 0; font-size: 14px; color: #0f172a;">' + req.title + '</h3>' +
           '<p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; line-height: 1.4;">' + desc + '</p>' +
           '<a href="/requests/' + req.id + '" style="display: block; text-align: center; background-color: #10b981; color: white; padding: 6px 0; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: bold;">Voir le détail</a>' +
        '</div>';

      marker.bindPopup(popupContent);
      this.markersLayer.addLayer(marker);
      bounds.extend([req.lat, req.lng]);
    });

    if (bounds.isValid()) this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }
}
EOF

echo "✅ Popups enrichis installés."
echo "👉 Rafraîchis la page, clique sur un marqueur pour voir l'image et la description."