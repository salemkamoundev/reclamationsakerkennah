import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private supabase: SupabaseClient;

  constructor() {
    // Initialisation avec options pour désactiver la persistance de session
    // Cela évite l'erreur "NavigatorLockAcquireTimeoutError"
    this.supabase = createClient(environment.supabase.url, environment.supabase.key, {
      auth: {
        persistSession: false,     // Ne pas sauvegarder la session dans le navigateur
        autoRefreshToken: false,   // Pas de rafraichissement auto
        detectSessionInUrl: false  // Ne pas regarder l'URL
      }
    });
  }

  /**
   * Upload un fichier vers le bucket Supabase et retourne l'URL publique
   */
  async uploadFile(file: File, folder: string = 'requests'): Promise<string> {
    // Nettoyage du nom de fichier
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filePath = `${folder}/${Date.now()}_${cleanName}`;

    // 1. Upload
    const { data, error } = await this.supabase.storage
      .from(environment.supabase.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erreur Supabase Upload:', error);
      throw new Error(error.message);
    }

    // 2. URL Publique
    const { data: publicData } = this.supabase.storage
      .from(environment.supabase.bucket)
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  }
}
