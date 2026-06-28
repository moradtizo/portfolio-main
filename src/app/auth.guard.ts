import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SupabaseService } from './supabase.service';

/**
 * Route guard for protected pages (e.g. /admin). Waits for the initial
 * session probe to finish, then either lets the route activate or redirects
 * to /login with a `redirect` query param so we can return after login.
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: SupabaseService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    await this.auth.whenReady();
    if (this.auth.isAdmin()) return true;
    return this.router.createUrlTree(['/login'], {
      queryParams: { redirect: '/admin', reason: 'session' }
    });
  }
}
