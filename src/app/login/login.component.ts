import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppwriteService } from '../appwrite.service';

/**
 * Login screen for the admin area. Email + password against Appwrite.
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

  private redirectTo = '/admin';

  constructor(
    private auth: AppwriteService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    const r = this.route.snapshot.queryParamMap.get('redirect');
    if (r) this.redirectTo = r;

    // If already signed in, skip the form.
    await this.auth.whenReady();
    if (this.auth.isAuthed()) {
      this.router.navigateByUrl(this.redirectTo);
    }
  }

  async submit(): Promise<void> {
    if (this.loading) return;
    this.error = null;

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
      // Common Appwrite codes:
      //   401: invalid credentials
      //   429: too many requests
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
