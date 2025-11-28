import { Component, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { Request } from '../../../core/models/request.model';

@Component({
  selector: 'app-request-map',
  template: '<div id="map" class="h-full w-full rounded-lg shadow-inner border border-slate-300 z-0"></div>',
  styles: [
    ':host { display: block; height: 100%; width: 100%; }'
  ]
})
export class RequestMapComponent implements AfterViewInit, OnChanges {
  // Mode 1 : Point unique (Détail / Création)
  @Input() lat: number = 34.71;
  @Input() lng: number = 11.17;
  
  // Mode 2 : Liste de points (Vue Globale)
  @Input() requests: Request[] | null = null;
  
  @Input() readonly: boolean = true;
  @Output() coordsSelected = new EventEmitter<{lat: number, lng: number}>();

  private map!: L.Map;
  private markersLayer = L.layerGroup(); // Groupe pour gérer les marqueurs

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) return;

    // Cas 1 : Changement de coordonnées unique
    if (changes['lat'] || changes['lng']) {
      this.refreshSingleMarker();
    }

    // Cas 2 : Changement de la liste de requêtes
    if (changes['requests'] && this.requests) {
      this.refreshMultipleMarkers();
    }
  }

  private initMap(): void {
    // Fix icônes Leaflet
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    // Init Map
    this.map = L.map('map').setView([this.lat, this.lng], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    // Initialisation du contenu
    if (this.requests) {
      this.refreshMultipleMarkers();
    } else {
      this.refreshSingleMarker();
    }

    // Gestion du clic (seulement si pas readonly et pas en mode multi)
    if (!this.readonly && !this.requests) {
      this.map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        this.lat = lat;
        this.lng = lng;
        this.refreshSingleMarker();
        this.coordsSelected.emit({ lat, lng });
      });
    }
  }

  private refreshSingleMarker() {
    this.markersLayer.clearLayers();
    const marker = L.marker([this.lat, this.lng]);
    this.markersLayer.addLayer(marker);
    this.map.setView([this.lat, this.lng], this.map.getZoom());
  }

  private refreshMultipleMarkers() {
    this.markersLayer.clearLayers();
    
    if (!this.requests || this.requests.length === 0) return;

    const bounds = L.latLngBounds([]);

    this.requests.forEach(req => {
      const marker = L.marker([req.lat, req.lng]);
      
      // Popup avec lien HTML basique
      const popupContent = \`
        <div style="text-align:center">
          <strong style="font-size:14px">\${req.title}</strong><br/>
          <span style="font-size:11px; color:#666">\${req.category || 'Autre'}</span><br/>
          <a href="/requests/\${req.id}" style="display:inline-block; margin-top:5px; color:#10b981; font-weight:bold; text-decoration:none">Voir le détail</a>
        </div>
      \`;
      
      marker.bindPopup(popupContent);
      this.markersLayer.addLayer(marker);
      bounds.extend([req.lat, req.lng]);
    });

    // Ajuster le zoom pour tout voir
    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
}
