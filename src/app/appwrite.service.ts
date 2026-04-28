import { Injectable } from '@angular/core';
import { Client, Databases, Storage, Account, Models, ID, AppwriteException } from 'appwrite';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';

export type AppwriteUser = Models.User<Models.Preferences>;

export type CvLang = 'en' | 'fr';

export interface CvFileMeta {
  pdfPath: string;       // Logical path (kept for parity with old service): cvs/cv-{lang}.pdf
  pdfUrl: string;        // Public file-view URL
  fileName: string;      // Original filename
  size: number;          // Bytes
  uploadedAt?: string;   // ISO timestamp
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

/**
 * Per-language stable file ID so each language always points to one canonical
 * file in the bucket (overwrites delete-then-recreate).
 */
const FILE_ID = (lang: CvLang) => `cv-${lang}`;

/**
 * Appwrite-backed CV service. Keeps the same public surface area as the old
 * FirebaseService so callers don't need to change their flow:
 *   uploadFile, getDownloadUrl, getCvDoc, saveCvFileMeta, saveCvStructured.
 */
@Injectable({ providedIn: 'root' })
export class AppwriteService {
  private client: Client;
  private storage: Storage;
  private db: Databases;
  private account: Account;

  /** Current logged-in user, or null if anonymous. Use as observable. */
  private readonly user$ = new BehaviorSubject<AppwriteUser | null>(null);
  readonly currentUser$ = this.user$.asObservable();

  /**
   * Set to true once we've checked the session at least once. Guards can
   * `await` this so they don't bounce to /login during a race on first load.
   */
  private readyResolve!: () => void;
  private readonly ready = new Promise<void>((res) => (this.readyResolve = res));

  // Cache the local File so admin code can read its name/size after upload
  // without an extra round trip.
  constructor() {
    this.client = new Client()
      .setEndpoint(environment.appwrite.endpoint)
      .setProject(environment.appwrite.projectId);

    this.storage = new Storage(this.client);
    this.db = new Databases(this.client);
    this.account = new Account(this.client);

    console.log('[Appwrite] initialized', {
      endpoint: environment.appwrite.endpoint,
      project: environment.appwrite.projectId
    });

    // Probe for an existing session on app start.
    this.refreshUser().finally(() => this.readyResolve());
  }

  // ---------------------------------------------------------------------
  //  AUTH — login / logout / current user
  // ---------------------------------------------------------------------

  /** Resolves once the initial session probe has completed. */
  whenReady(): Promise<void> {
    return this.ready;
  }

  /** Returns the cached user synchronously (may be null). */
  get user(): AppwriteUser | null {
    return this.user$.getValue();
  }

  /** True if a session is currently active. */
  isAuthed(): boolean {
    return this.user$.getValue() !== null;
  }

  /**
   * Log in with email + password. Updates currentUser$ on success.
   * Throws AppwriteException on failure (caller should catch and surface).
   */
  async login(email: string, password: string): Promise<AppwriteUser> {
    // Some Appwrite SDK versions expose createEmailPasswordSession, older
    // ones expose createEmailSession — try both for compatibility.
    const acc: any = this.account;
    if (typeof acc.createEmailPasswordSession === 'function') {
      await acc.createEmailPasswordSession(email, password);
    } else if (typeof acc.createEmailSession === 'function') {
      await acc.createEmailSession(email, password);
    } else {
      throw new Error('Appwrite SDK is missing email session methods.');
    }
    const u = await this.account.get();
    this.user$.next(u);
    return u;
  }

  /** Log out and clear cached user. */
  async logout(): Promise<void> {
    try {
      await this.account.deleteSession('current');
    } catch (err) {
      // If session was already invalid, ignore — just clear local state.
      console.warn('[Appwrite] logout warning', err);
    }
    this.user$.next(null);
  }

  /** Re-fetch the current user. Returns null if no session. */
  async refreshUser(): Promise<AppwriteUser | null> {
    try {
      const u = await this.account.get();
      this.user$.next(u);
      return u;
    } catch {
      // 401 / no session — that's fine, we're anonymous.
      this.user$.next(null);
      return null;
    }
  }

  // ---------------------------------------------------------------------
  //  STORAGE — upload / download
  // ---------------------------------------------------------------------

  /**
   * Upload a PDF for the given language. Always uses a stable file ID so
   * uploading again overwrites the previous file (delete-then-create).
   * Emits upload progress (0–100) and completes when done.
   */
  uploadFile(lang: CvLang, file: File): Observable<number> {
    return new Observable<number>((observer) => {
      const fileId = FILE_ID(lang);
      const bucketId = environment.appwrite.cvsBucketId;

      const doUpload = () => {
        // Cast: Appwrite SDK's createFile accepts (bucketId, fileId, file, permissions?, onProgress?)
        // but the type definitions in v24 lean on the params-object overload.
        // The positional-args overload is still supported and easier to call here.
        (this.storage.createFile as any)(
          bucketId,
          fileId,
          file,
          undefined,
          (p: { progress: number }) => {
            const pct = Math.round(p?.progress ?? 0);
            observer.next(pct);
          }
        )
          .then(() => {
            observer.next(100);
            observer.complete();
          })
          .catch((err: unknown) => {
            console.error('[Appwrite] createFile failed', err);
            observer.error(err);
          });
      };

      // Try to delete any existing file with this ID, then upload. We swallow
      // 404 (file didn't exist yet — that's fine).
      this.storage
        .deleteFile(bucketId, fileId)
        .catch((err: unknown) => {
          if (err instanceof AppwriteException && err.code === 404) return;
          // Other errors (permission, etc.) — log but still try to upload;
          // createFile will surface a clearer error if it also fails.
          console.warn('[Appwrite] deleteFile (pre-upload) warning', err);
        })
        .then(doUpload);
    });
  }

  /**
   * Get a public file-view URL for the given language's CV file.
   * Throws if the bucket isn't configured for public read.
   */
  getDownloadUrl(lang: CvLang): string {
    const bucketId = environment.appwrite.cvsBucketId;
    const url = this.storage.getFileView(bucketId, FILE_ID(lang));
    // Appwrite's getFileView returns either a string or a URL — coerce to string.
    return typeof url === 'string' ? url : (url as any).toString();
  }

  // ---------------------------------------------------------------------
  //  DATABASE — CV documents
  //  Database: env.databaseId, Collection: env.cvsCollectionId,
  //  Document IDs: 'en' | 'fr'.
  //  Attributes:
  //    lang      string
  //    fileId    string  (Appwrite Storage file ID)
  //    fileName  string
  //    fileSize  integer
  //    fileUrl   string  (cached public URL)
  //    data      string  (JSON-stringified CvStructured)
  //    uploadedAt string (ISO)
  // ---------------------------------------------------------------------

  saveCvFileMeta(lang: CvLang, file: CvFileMeta): Promise<void> {
    return this.db
      .upsertDocument(
        environment.appwrite.databaseId,
        environment.appwrite.cvsCollectionId,
        lang,
        {
          lang,
          fileId: FILE_ID(lang),
          fileName: file.fileName,
          fileSize: file.size,
          fileUrl: file.pdfUrl,
          uploadedAt: file.uploadedAt ?? new Date().toISOString()
        }
      )
      .then(() => {
        console.log(`[Appwrite] saveCvFileMeta(${lang}) ok`);
      });
  }

  saveCvStructured(lang: CvLang, structured: CvStructured): Promise<void> {
    return this.db
      .upsertDocument(
        environment.appwrite.databaseId,
        environment.appwrite.cvsCollectionId,
        lang,
        {
          lang,
          data: JSON.stringify(structured)
        }
      )
      .then(() => {
        console.log(`[Appwrite] saveCvStructured(${lang}) ok`);
      });
  }

  /**
   * Read the CV doc for a language. Returns null if it doesn't exist yet.
   */
  getCvDoc(lang: CvLang): Observable<CvDoc | null> {
    return new Observable((observer) => {
      this.db
        .getDocument(
          environment.appwrite.databaseId,
          environment.appwrite.cvsCollectionId,
          lang
        )
        .then((doc: any) => {
          observer.next(this.hydrate(lang, doc));
          observer.complete();
        })
        .catch((err: unknown) => {
          if (err instanceof AppwriteException && err.code === 404) {
            observer.next(null);
            observer.complete();
            return;
          }
          console.error(`[Appwrite] getCvDoc(${lang}) failed`, err);
          observer.error(err);
        });
    });
  }

  private hydrate(lang: CvLang, doc: any): CvDoc {
    const file: CvFileMeta | null = doc?.fileId
      ? {
          pdfPath: `cvs/cv-${lang}.pdf`,
          pdfUrl: doc.fileUrl ?? this.getDownloadUrl(lang),
          fileName: doc.fileName ?? '',
          size: typeof doc.fileSize === 'number' ? doc.fileSize : 0,
          uploadedAt: doc.uploadedAt ?? undefined
        }
      : null;

    let structured: CvStructured | null = null;
    if (typeof doc?.data === 'string' && doc.data.length > 0) {
      try {
        structured = JSON.parse(doc.data) as CvStructured;
      } catch (e) {
        console.warn('[Appwrite] could not parse structured CV JSON', e);
        structured = null;
      }
    }

    return {
      lang,
      file,
      structured,
      updatedAt: doc?.$updatedAt
    };
  }
}
