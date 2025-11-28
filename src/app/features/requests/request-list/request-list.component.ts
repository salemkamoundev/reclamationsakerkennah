import { Component, inject } from '@angular/core';
import { RequestsService } from '../../../core/services/requests.service';
import { SeederService } from '../../../core/services/seeder.service';
import { combineLatest, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestCategory } from '../../../core/models/request.model';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.css']
})
export class RequestListComponent {
  private requestsService = inject(RequestsService);
  seeder = inject(SeederService);
  loadingSeed = false;

  // Filtres Réactifs
  searchTerm$ = new BehaviorSubject<string>('');
  categoryFilter$ = new BehaviorSubject<string>('All');

  // Categories pour le select
  categories: string[] = ['All', 'Voirie', 'Eclairage', 'Déchets', 'Sécurité', 'Autre'];

  // Flux de données combiné : Requêtes Firestore + Filtre Recherche + Filtre Catégorie
  vm$ = combineLatest([
    this.requestsService.getApprovedRequests(),
    this.searchTerm$,
    this.categoryFilter$
  ]).pipe(
    map(([requests, term, category]) => {
      // 1. Filtrer par Catégorie
      let filtered = (category === 'All') 
        ? requests 
        : requests.filter(r => r.category === category);

      // 2. Filtrer par Recherche Texte
      if (term) {
        const lowerTerm = term.toLowerCase();
        filtered = filtered.filter(r => 
          r.title.toLowerCase().includes(lowerTerm) || 
          r.description.toLowerCase().includes(lowerTerm)
        );
      }

      return { requests: filtered, total: requests.length, displayed: filtered.length };
    })
  );

  onSearch(term: string) {
    this.searchTerm$.next(term);
  }

  onCategoryChange(cat: string) {
    this.categoryFilter$.next(cat);
  }

  // Seeder logic
  async generateDemoData() {
    if(!confirm("Générer des données de test ?")) return;
    this.loadingSeed = true;
    try {
      await this.seeder.seedData();
      alert("Données générées !");
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      this.loadingSeed = false;
    }
  }
}
