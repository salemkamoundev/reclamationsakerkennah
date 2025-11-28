import { Component, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-request-map',
  template: '<div id="map" class="h-full w-full rounded-lg shadow-inner border border-slate-300 z-0"></div>',
  styles: [':host { display: block; height: 100%; width: 100%; }'],
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

  ngAfterViewInit(): void { this.initMap(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) return;
    if (changes['lat'] || changes['lng']) this.refreshSingleMarker();
    if (changes['requests'] && this.requests) this.refreshMultipleMarkers();
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
  }

  private refreshSingleMarker() {
    this.markersLayer.clearLayers();
    L.marker([this.lat, this.lng]).addTo(this.markersLayer);
    this.map.setView([this.lat, this.lng], 11);
  }

  private refreshMultipleMarkers() {
    this.markersLayer.clearLayers();
    if (!this.requests || this.requests.length === 0) return;
    const bounds = L.latLngBounds([]);
    
    this.requests.forEach(req => {
      const marker = L.marker([req.lat, req.lng]);
      // Correction ici : utilisation de simples guillemets pour éviter les problèmes de shell script
      const popup = '<b>' + req.title + '</b><br><a href="/requests/' + req.id + '">Voir</a>';
      marker.bindPopup(popup);
      this.markersLayer.addLayer(marker);
      bounds.extend([req.lat, req.lng]);
    });

    if (bounds.isValid()) this.map.fitBounds(bounds, { padding: [50, 50] });
  }
}
