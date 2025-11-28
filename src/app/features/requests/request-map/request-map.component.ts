import { Component, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-request-map',
  template: '<div id="map" class="h-64 w-full rounded-lg shadow-inner border border-slate-300"></div>',
  styles: []
})
export class RequestMapComponent implements AfterViewInit, OnChanges {
  @Input() lat: number = 34.71; // Centre de Kerkennah par défaut
  @Input() lng: number = 11.17;
  @Input() readonly: boolean = true;
  @Output() coordsSelected = new EventEmitter<{lat: number, lng: number}>();

  private map!: L.Map;
  private marker?: L.Marker;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si les coordonnées changent et que la carte est prête, on déplace le marqueur
    if (this.map && (changes['lat'] || changes['lng'])) {
      this.updateMarker(this.lat, this.lng);
      this.map.setView([this.lat, this.lng], 12);
    }
  }

  private initMap(): void {
    // Fix des icônes Leaflet dans Angular/Webpack
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

    // Création de la carte
    this.map = L.map('map').setView([this.lat, this.lng], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Ajout du marqueur initial
    if (this.lat && this.lng) {
      this.updateMarker(this.lat, this.lng);
    }

    // Gestion du clic (seulement si non readonly)
    if (!this.readonly) {
      this.map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        this.updateMarker(lat, lng);
        this.coordsSelected.emit({ lat, lng });
      });
    }
  }

  private updateMarker(lat: number, lng: number) {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }
  }
}
