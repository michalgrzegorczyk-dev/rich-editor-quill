import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from "./app/app.component";
import {ApplicationConfig, provideZoneChangeDetection} from "@angular/core";
import {provideAnimations} from "@angular/platform-browser/animations";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations()]
};

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));