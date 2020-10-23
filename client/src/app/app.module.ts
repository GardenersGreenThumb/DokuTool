import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

/**
 * Diese Funktion initialisiert Keycloak
 * Es müssen die jeweiligen Parameter zur Verbindung mit dem Keycloak Server angegeben werden.
 * Alle Dateien im Assets Ordner werden nicht von Keycloak geschützt.
 * Hier wird auch die 'silent-check-sso.html' eingebunden.
 * Mehr Infos: https://www.npmjs.com/package/keycloak-angular
 * @param keycloak 
 */
function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8080/auth',
        realm: 'Dokutool',
        clientId: 'dokutool-frontend',
      },
      bearerExcludedUrls: ['/assets'],
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html',
      },
    });
}

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    KeycloakAngularModule
  ],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: initializeKeycloak,
    multi: true,
    deps: [KeycloakService],
  },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
