import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PdfStoreService } from './pdf-store.service';

const LOCAL_STORAGE_KEY = 'cvUrl';
const MODE_KEY = 'cvMode'; // 'url' | 'file'

@Injectable({ providedIn: 'root' })
export class CvService {
  private readonly defaultUrl = 'assets/cv/Mourad_Tizougarine.pdf';
  private readonly _cvUrl$ = new BehaviorSubject<string>(this.getInitialUrl());
  private readonly _mode$ = new BehaviorSubject<'url' | 'file'>(this.getInitialMode());

  constructor(private pdfStore: PdfStoreService) {}

  private getInitialUrl(): string {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored || this.defaultUrl;
    } catch {
      return this.defaultUrl;
    }
  }
  private getInitialMode(): 'url' | 'file' {
    try {
      const m = localStorage.getItem(MODE_KEY);
      return (m === 'file' || m === 'url') ? m : 'url';
    } catch {
      return 'url';
    }
  }

  get url$(): Observable<string> {
    return this._cvUrl$.asObservable();
  }
  get mode$(): Observable<'url' | 'file'> {
    return this._mode$.asObservable();
  }

  get url(): string {
    return this._cvUrl$.value;
  }
  get mode(): 'url' | 'file' {
    return this._mode$.value;
  }

  setUrl(url: string): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, url);
      localStorage.setItem(MODE_KEY, 'url');
    } catch {}
    this._cvUrl$.next(url);
    this._mode$.next('url');
  }

  async setFile(file: File): Promise<void> {
    await this.pdfStore.save(file);
    try {
      localStorage.setItem(MODE_KEY, 'file');
    } catch {}
    this._mode$.next('file');
  }

  async getFile(): Promise<{ blob: Blob; name: string } | null> {
    return this.pdfStore.get();
  }

  async reset(): Promise<void> {
    try {
      await this.pdfStore.clear();
    } catch {}
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.setItem(MODE_KEY, 'url');
    } catch {}
    this._cvUrl$.next(this.defaultUrl);
    this._mode$.next('url');
  }
}
