import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { DownloadService } from 'src/assets/download.service';
import { CvService } from '../cv.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import emailjs from 'emailjs-com';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading = false;
  downloading = false;

  // Contact form (lives on the single-page home now)
  contactForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private downloadService: DownloadService,
    private cv: CvService,
    private router: Router
  ) {
    this.contactForm = this.fb.group({
      name:    ['', Validators.required],
      email:   ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.setupNavigationLoading();
  }

  ngAfterViewInit(): void {
    // Scroll-reveal observer for .reveal elements
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  private setupNavigationLoading(): void {
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this.isLoading = true;
        } else if (event instanceof NavigationEnd || event instanceof NavigationError) {
          this.isLoading = false;
        }
      });
  }

  scrollTo(anchor: string): void {
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  downloadCV(): void {
    this.downloading = true;

    if (this.cv.mode === 'file') {
      this.cv.getFile().then((f) => {
        if (f) {
          this.downloadService.downloadBlob(f.blob, f.name || 'cv.pdf');
        } else {
          this.downloadService.downloadFile(this.cv.url);
        }
        this.downloading = false;
      }).catch(() => {
        this.downloading = false;
      });
      return;
    }

    this.downloadService.downloadFile(this.cv.url);
    this.downloading = false;
  }

  onSubmit(): void {
    if (this.contactForm.invalid) return;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const templateParams = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      subject: this.contactForm.value.subject,
      message: this.contactForm.value.message,
      time: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),
    };

    emailjs.send(
      'service_whf8k9w',
      'template_iobz4s9',
      templateParams,
      'cKf6oJldB0xXWJ8zF'
    )
    .then(() => {
      this.successMessage = 'Message sent successfully ✅';
      this.contactForm.reset();
    })
    .catch(() => {
      this.errorMessage = 'Something went wrong ❌ Please try again.';
    })
    .finally(() => {
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
