import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module'; // On s'assure du point (.)

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
