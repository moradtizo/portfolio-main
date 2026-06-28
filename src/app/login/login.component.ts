import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../supabase.service';

/**
 * Login screen for the admin area. Email + password against Supabase.
 * On success, redirects to ?redirect= (default /admin).
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;
  info: string | null = null;

  private redirectTo = '/admin';

  constructor(
    private auth: SupabaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    const r = this.route.snapshot.queryParamMap.get('redirect');
    if (r) this.redirectTo = r;
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'session') {
      this.info = 'Please sign in again to continue to the admin panel.';
    }

    // If already signed in, skip the form.
    await this.auth.whenReady();
    if (this.auth.isAdmin()) {
      this.router.navigateByUrl(this.redirectTo);
    }
  }

  async submit(): Promise<void> {
    if (this.loading) return;
    this.error = null;
    this.info = null;

    const email = this.email.trim();
    const password = this.password;
    if (!email || !password) {
      this.error = 'Please enter your email and password.';
      return;
    }

    this.loading = true;
    try {
      await this.auth.login(email, password);
      this.router.navigateByUrl(this.redirectTo);
    } catch (err: any) {
      console.error('[login] failed', err);
      const code = err?.code;
      if (code === 401) {
        this.error = 'Invalid email or password.';
      } else if (code === 429) {
        this.error = 'Too many attempts. Please wait a moment and try again.';
      } else {
        this.error = err?.message || 'Login failed. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }
}
