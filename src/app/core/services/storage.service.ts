import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage = inject(Storage);

  async uploadFile(file: File, folder: string = 'requests'): Promise<string> {
    const filePath = `${folder}/${Date.now()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);
    
    // Upload
    await uploadBytes(storageRef, file);
    
    // Récupération de l'URL publique
    return await getDownloadURL(storageRef);
  }
}
