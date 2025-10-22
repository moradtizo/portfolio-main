import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { DownloadService } from 'src/assets/download.service';
import { CvService } from '../cv.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Typed from 'typed.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoading = false;
  downloading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private downloadService: DownloadService,
    private cv: CvService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeTypedAnimation();
    this.setupNavigationLoading();
  }

  private initializeTypedAnimation(): void {
    const options = {
      strings: ['Hi! I\'m <b>"Mourad"</b>'],
      typeSpeed: 200,
      backSpeed: 50,
      smartBackspace: true,
      loop: true
    };
    const typed = new Typed('#typed-text', options);
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}