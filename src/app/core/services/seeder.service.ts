import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, Timestamp } from '@angular/fire/firestore';
import { RequestCategory } from '../models/request.model';

@Injectable({
  providedIn: 'root'
})
export class SeederService {
  private firestore = inject(Firestore);

  private dummyRequests = [
    {
      title: "Nid de poule dangereux",
      description: "Un gros trou s'est formé sur la route principale vers Ramla. Très dangereux pour les scooters la nuit.",
      category: "Voirie" as RequestCategory,
      status: "approved",
      lat: 34.7125,
      lng: 11.1702,
      createdAt: new Date(),
      createdBy: "system_demo"
    },
    {
      title: "Éclairage public HS",
      description: "Les lampadaires du port de Sidi Youssef ne fonctionnent plus depuis 3 jours.",
      category: "Eclairage" as RequestCategory,
      status: "pending",
      lat: 34.6471,
      lng: 11.0289,
      createdAt: new Date(),
      createdBy: "system_demo"
    },
    {
      title: "Déchets sur la plage",
      description: "Accumulation de plastique après la tempête sur la plage de Sidi Fredj. Besoin d'un nettoyage urgent.",
      category: "Déchets" as RequestCategory,
      status: "approved",
      lat: 34.7240,
      lng: 11.1400,
      createdAt: new Date(),
      createdBy: "system_demo"
    },
    {
      title: "Panneau stop manquant",
      description: "Le panneau a été arraché par le vent au croisement.",
      category: "Sécurité" as RequestCategory,
      status: "rejected",
      lat: 34.7000,
      lng: 11.1600,
      createdAt: new Date(),
      createdBy: "system_demo"
    }
  ];

  async seedData() {
    const requestsCol = collection(this.firestore, 'requests');
    const commentsCol = collection(this.firestore, 'comments');

    const promises = this.dummyRequests.map(async (req) => {
      const docRef = await addDoc(requestsCol, {
        ...req,
        createdAt: Timestamp.fromDate(req.createdAt)
      });
      
      if (req.status === 'approved') {
        await addDoc(commentsCol, {
          requestId: docRef.id,
          content: "Merci pour le signalement, l'équipe technique est prévenue.",
          authorId: "admin_demo",
          authorEmail: "mairie@kerkennah.tn",
          status: "approved",
          createdAt: Timestamp.now()
        });
      }
    });

    await Promise.all(promises);
    return true;
  }
}
