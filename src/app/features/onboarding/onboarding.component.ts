import { Component } from '@angular/core';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  standalone: false
})
export class OnboardingComponent {
  
  // Si true, le tuto est visible.
  isVisible = false;
  
  currentSlide = 0;

  slides = [
    {
      title: "Bienvenue sur Remarques pour Kerkennah",
      description: "La plateforme citoyenne pour améliorer la vie sur l'archipel de Kerkennah.",
      icon: "🏝️",
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Signalez un problème",
      description: "Voirie, éclairage, déchets... Prenez une photo, géolocalisez le lieu et envoyez.",
      icon: "📸",
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      title: "Suivez l'évolution",
      description: "Restez informé de la validation de votre demande et échangez avec la communauté.",
      icon: "🤝",
      color: "bg-orange-100 text-orange-600"
    }
  ];

  ngOnInit() {
    // On vérifie si l'utilisateur a déjà vu le tuto
    const seen = localStorage.getItem('rk_onboarding_seen');
    if (!seen) {
      this.isVisible = true;
    }
  }

  next() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
    } else {
      this.finish();
    }
  }

  skip() {
    this.finish();
  }

  finish() {
    // Animation de sortie simple via CSS (si géré) ou juste fermeture
    this.isVisible = false;
    // On enregistre que c'est vu
    localStorage.setItem('rk_onboarding_seen', 'true');
  }
}
