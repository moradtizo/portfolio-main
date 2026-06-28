import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';

export type SupabaseUser = User;

export type CvLang = 'en' | 'fr';

export interface CvFileMeta {
  pdfPath: string;
  pdfUrl: string;
  fileName: string;
  size: number;
  uploadedAt?: string;
}

export interface CvExperience {
  date: string;
  role: string;
  company?: string;
  description?: string;
}

export interface CvEducation {
  date?: string;
  role: string;
  school: string;
}

export interface CvStructured {
  fullName?: string;
  title?: string;
  summary?: string;
  email?: string;
  phone?: string;
  location?: string;
  experience?: CvExperience[];
  education?: CvEducation[];
  skills?: string[];
}

export interface CvDoc {
  lang: CvLang;
  file?: CvFileMeta | null;
  structured?: CvStructured | null;
  updatedAt?: string;
}

const FILE_PATH = (lang: CvLang) => `cv-${lang}.pdf`;
const TABLE_NAME = 'cvs';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  private readonly user$ = new BehaviorSubject<SupabaseUser | null>(null);
  readonly currentUser$ = this.user$.asObservable();

  private readyResolve!: () => void;
  private readonly ready = new Promise<void>((res) => (this.readyResolve = res));

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.publishableKey
    );

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.user$.next(session?.user ?? null);
    });

    this.refreshUser().finally(() => this.readyResolve());
  }

  whenReady(): Promise<void> {
    return this.ready;
  }

  get user(): SupabaseUser | null {
    return this.user$.getValue();
  }

  get userEmail(): string | null {
    return this.user$.getValue()?.email ?? null;
  }

  isAuthed(): boolean {
    return this.user$.getValue() !== null;
  }

  isAdmin(): boolean {
    const user = this.user$.getValue();
    if (!user) return false;

    const adminEmails = environment.supabase.adminEmails.map((email) =>
      email.trim().toLowerCase()
    );

    if (adminEmails.length === 0) return true;

    const userEmail = user.email?.trim().toLowerCase();
    return !!userEmail && adminEmails.includes(userEmail);
  }

  async login(email: string, password: string): Promise<SupabaseUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    if (!data.user) throw new Error('Supabase login succeeded without a user.');
    this.user$.next(data.user);
    if (!this.isAdmin()) {
      await this.logout();
      throw new Error('This account is not allowed to access the admin panel.');
    }
    return data.user;
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.warn('[Supabase] logout warning', error);
    }
    this.user$.next(null);
  }

  async refreshUser(): Promise<SupabaseUser | null> {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) {
      this.user$.next(null);
      return null;
    }
    this.user$.next(data.user ?? null);
    return data.user ?? null;
  }

  uploadFile(lang: CvLang, file: File): Observable<number> {
    return new Observable<number>((observer) => {
      observer.next(0);

      this.supabase.storage
        .from(environment.supabase.cvsBucket)
        .upload(FILE_PATH(lang), file, {
          cacheControl: '3600',
          contentType: file.type || 'application/pdf',
          upsert: true
        })
        .then(({ error }) => {
          if (error) {
            observer.error(error);
            return;
          }
          observer.next(100);
          observer.complete();
        })
        .catch((err) => observer.error(err));
    });
  }

  getDownloadUrl(lang: CvLang): string {
    const { data } = this.supabase.storage
      .from(environment.supabase.cvsBucket)
      .getPublicUrl(FILE_PATH(lang));
    return data.publicUrl;
  }

  async saveCvFileMeta(lang: CvLang, file: CvFileMeta): Promise<void> {
    const uploadedAt = file.uploadedAt ?? new Date().toISOString();
    const { error } = await this.supabase.from(TABLE_NAME).upsert(
      {
        lang,
        file_path: FILE_PATH(lang),
        file_name: file.fileName,
        file_size: file.size,
        file_url: file.pdfUrl,
        uploaded_at: uploadedAt,
        updated_at: uploadedAt
      },
      { onConflict: 'lang' }
    );
    if (error) throw error;
  }

  async saveCvStructured(lang: CvLang, structured: CvStructured): Promise<void> {
    const { error } = await this.supabase.from(TABLE_NAME).upsert(
      {
        lang,
        data: structured,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'lang' }
    );
    if (error) throw error;
  }

  getCvDoc(lang: CvLang): Observable<CvDoc | null> {
    return new Observable((observer) => {
      this.supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('lang', lang)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            observer.error(error);
            return;
          }
          observer.next(data ? this.hydrate(lang, data) : null);
          observer.complete();
        }, (err: unknown) => observer.error(err));
    });
  }

  private hydrate(lang: CvLang, row: any): CvDoc {
    const fileUrl = row?.file_url ?? row?.fileUrl;
    const fileName = row?.file_name ?? row?.fileName;
    const fileSize = row?.file_size ?? row?.fileSize;

    const file: CvFileMeta | null = fileUrl || fileName
      ? {
          pdfPath: row?.file_path ?? row?.pdfPath ?? FILE_PATH(lang),
          pdfUrl: fileUrl ?? this.getDownloadUrl(lang),
          fileName: fileName ?? '',
          size: typeof fileSize === 'number' ? fileSize : 0,
          uploadedAt: row?.uploaded_at ?? row?.uploadedAt ?? undefined
        }
      : null;

    return {
      lang,
      file,
      structured: this.parseStructured(row?.data),
      updatedAt: row?.updated_at ?? row?.updatedAt ?? undefined
    };
  }

  private parseStructured(data: unknown): CvStructured | null {
    if (!data) return null;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as CvStructured;
      } catch (err) {
        console.warn('[Supabase] could not parse structured CV JSON', err);
        return null;
      }
    }
    return data as CvStructured;
  }
}
