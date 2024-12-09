import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from "./app/app.component";
import {ApplicationConfig, provideZoneChangeDetection} from "@angular/core";

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true })]
};

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
