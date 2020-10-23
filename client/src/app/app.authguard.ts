import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

/*
Dieser AuthGuard ist ein spezieller AuthGuard für Keycloak. Er ist so so konfiguriert, dass Routen nur für manche Rollen zugänglich sind.
Er ist 1:1 aus der Dokumentation für keycloak-angular (https://www.npmjs.com/package/keycloak-angular) übernommen.
Kann erweitert werden.
*/
@Injectable({
    providedIn: 'root',
})
export class AuthGuard extends KeycloakAuthGuard {
    constructor(
        protected readonly router: Router,
        protected readonly keycloak: KeycloakService
    ) {
        super(router, keycloak);
    }

    public async isAccessAllowed(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ) {
        // Force the user to log in if currently unauthenticated.
        if (!this.authenticated) {
            await this.keycloak.login({
                redirectUri: window.location.origin + state.url,
            });
        }

        // Get the roles required from the route.
        const requiredRoles = route.data.roles;

        // Allow the user to to proceed if no additional roles are required to access the route.
        if (!(requiredRoles instanceof Array) || requiredRoles.length === 0) {
            return true;
        }

        // Allow the user to proceed if all the required roles are present.
        return requiredRoles.every((role) => this.roles.includes(role));
    }
}