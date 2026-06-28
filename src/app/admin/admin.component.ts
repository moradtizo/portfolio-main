import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  CvDoc,
  CvEducation,
  CvExperience,
  CvLang,
  CvStructured,
  SupabaseService
} from '../supabase.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type Lang = 'en' | 'fr';
type Dict = { [key: string]: string };

interface CvSlotState {
  lang: CvLang;
  fileName: string | null;
  fileSize: number | null;
  uploadProgress: number | null;
  downloadUrl: string | null;
  isDragging: boolean;
}

interface StructuredForm {
  fullName: string;
  title: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  experience: CvExperience[];
  education: CvEducation[];
  skills: string; // comma-separated in the UI, parsed on save
}

function emptyStructuredForm(): StructuredForm {
  return {
    fullName: '',
    title: '',
    summary: '',
    email: '',
    phone: '',
    location: '',
    experience: [],
    education: [],
    skills: ''
  };
}

function emptySlot(lang: CvLang): CvSlotState {
  return {
    lang,
    fileName: null,
    fileSize: null,
    uploadProgress: null,
    downloadUrl: null,
    isDragging: false
  };
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  // Always true once we render — AuthGuard blocks /admin for anonymous
  // visitors. Kept as a flag so existing template *ngIf bindings still
  // work without rewiring every reference.
  isAuthenticated = true;
  isLoading = false;

  // Per-language upload slots
  slots: Record<CvLang, CvSlotState> = {
    en: emptySlot('en'),
    fr: emptySlot('fr')
  };

  // Per-language structured editor data
  structured: Record<CvLang, StructuredForm> = {
    en: emptyStructuredForm(),
    fr: emptyStructuredForm()
  };
  savingStructured: Record<CvLang, boolean> = { en: false, fr: false };

  // Which language tab is active in the structured editor
  editorLang: CvLang = 'en';

  // Languages to iterate in the template (typed as CvLang[])
  readonly languages: CvLang[] = ['en', 'fr'];

  // Status toast
  successMessage = '';
  errorMessage = '';
  private toastTimer: any = null;

  // Theme + UI Language (shared with home via localStorage)
  isDark = false;
  lang: Lang = 'en';

  private destroy$ = new Subject<void>();

  // ---- Translations -----------------------------------------------------
  private tx: { en: Dict; fr: Dict } = {
    en: {
      'panel.label': 'Admin panel',
      'panel.title.cv': 'CV',
      'panel.title.italic': 'management',
      'panel.subtitle': 'Manage the CV used by the public portfolio. Upload a new PDF for each language and edit the structured data stored in Supabase.',

      'login.label': 'Restricted area',
      'login.title.welcome': 'Welcome',
      'login.title.italic': 'back',
      'login.subtitle': 'Authentication required to access the admin panel.',
      'login.username': 'Username',
      'login.username.ph': 'admin',
      'login.password': 'Password',
      'login.password.ph': '••••••••',
      'login.submit': 'Sign in',
      'login.signing': 'Signing in…',
      'login.invalid': 'Invalid username or password.',

      'upload.label': 'Upload PDFs',
      'upload.title': 'CV files',
      'upload.subtitle': 'One PDF per language. Replacing a file overwrites the current one in Supabase Storage and updates the cvs table.',
      'upload.en': 'CV — English',
      'upload.fr': 'CV — Français',
      'upload.dropzone.title': 'Click to upload or drag a PDF here',
      'upload.dropzone.sub': 'PDF only · Max 10 MB',
      'upload.uploading': 'Uploading',
      'upload.success': 'CV uploaded successfully',
      'upload.error.notpdf': 'Please select a PDF file',
      'upload.error.nofile': 'No file selected',
      'upload.error.generic': 'Upload failed',
      'upload.current': 'Current file',
      'upload.size': 'Size',
      'upload.none': 'No upload yet',

      'structured.label': 'Structured data',
      'structured.title': 'CV',
      'structured.title.italic': 'content',
      'structured.subtitle': 'Stored in Supabase (table: cvs). The portfolio can render this directly without parsing the PDF.',
      'structured.fullName': 'Full name',
      'structured.title.field': 'Title / Role',
      'structured.summary': 'Summary',
      'structured.email': 'Email',
      'structured.phone': 'Phone',
      'structured.location': 'Location',
      'structured.experience': 'Experience',
      'structured.education': 'Education',
      'structured.skills': 'Skills (comma-separated)',
      'structured.add': 'Add row',
      'structured.remove': 'Remove',
      'structured.save': 'Save to Supabase',
      'structured.saving': 'Saving…',
      'structured.saved': 'Saved!',
      'structured.exp.role': 'Role',
      'structured.exp.company': 'Company',
      'structured.exp.date': 'Date',
      'structured.exp.desc': 'Description',
      'structured.edu.role': 'Diploma / Program',
      'structured.edu.school': 'School',
      'structured.edu.date': 'Date',

      'actions.download': 'Download current CV',
      'actions.logout': 'Logout',
      'actions.viewsite': 'View site',
      'actions.copy': 'Copy link',
      'actions.copied': 'Link copied!',

      'footer.back': '← Back to portfolio'
    },
    fr: {
      'panel.label': 'Panneau admin',
      'panel.title.cv': 'Gestion du',
      'panel.title.italic': 'CV',
      'panel.subtitle': 'Gérez le CV utilisé par le portfolio public. Téléversez un PDF par langue et modifiez les données structurées stockées dans Supabase.',

      'login.label': 'Zone restreinte',
      'login.title.welcome': 'Bon retour',
      'login.title.italic': 'parmi nous',
      'login.subtitle': "Authentification requise pour accéder au panneau d'administration.",
      'login.username': "Nom d'utilisateur",
      'login.username.ph': 'admin',
      'login.password': 'Mot de passe',
      'login.password.ph': '••••••••',
      'login.submit': 'Se connecter',
      'login.signing': 'Connexion…',
      'login.invalid': 'Identifiants incorrects.',

      'upload.label': 'Téléverser les PDFs',
      'upload.title': 'Fichiers CV',
      'upload.subtitle': 'Un PDF par langue. Remplacer un fichier écrase le précédent dans Supabase Storage et met à jour la table cvs.',
      'upload.en': 'CV — Anglais',
      'upload.fr': 'CV — Français',
      'upload.dropzone.title': 'Cliquez pour téléverser ou déposez un fichier ici',
      'upload.dropzone.sub': 'PDF uniquement · Max 10 Mo',
      'upload.uploading': 'Téléversement',
      'upload.success': 'CV téléversé avec succès',
      'upload.error.notpdf': 'Veuillez sélectionner un fichier PDF',
      'upload.error.nofile': 'Aucun fichier sélectionné',
      'upload.error.generic': 'Échec du téléversement',
      'upload.current': 'Fichier actuel',
      'upload.size': 'Taille',
      'upload.none': 'Aucun téléversement',

      'structured.label': 'Données structurées',
      'structured.title': 'Contenu du',
      'structured.title.italic': 'CV',
      'structured.subtitle': 'Stocké dans Supabase (table : cvs). Le portfolio peut afficher ces données sans analyser le PDF.',
      'structured.fullName': 'Nom complet',
      'structured.title.field': 'Titre / Poste',
      'structured.summary': 'Résumé',
      'structured.email': 'E-mail',
      'structured.phone': 'Téléphone',
      'structured.location': 'Localisation',
      'structured.experience': 'Expérience',
      'structured.education': 'Formation',
      'structured.skills': 'Compétences (séparées par des virgules)',
      'structured.add': 'Ajouter une ligne',
      'structured.remove': 'Supprimer',
      'structured.save': 'Enregistrer dans Supabase',
      'structured.saving': 'Enregistrement…',
      'structured.saved': 'Enregistré !',
      'structured.exp.role': 'Poste',
      'structured.exp.company': 'Entreprise',
      'structured.exp.date': 'Date',
      'structured.exp.desc': 'Description',
      'structured.edu.role': 'Diplôme / Cursus',
      'structured.edu.school': 'École',
      'structured.edu.date': 'Date',

      'actions.download': 'Télécharger le CV actuel',
      'actions.logout': 'Déconnexion',
      'actions.viewsite': 'Voir le site',
      'actions.copy': 'Copier le lien',
      'actions.copied': 'Lien copié !',

      'footer.back': '← Retour au portfolio'
    }
  };

  t(key: string): string {
    const dict = this.tx[this.lang] || this.tx.en;
    return dict[key] ?? this.tx.en[key] ?? key;
  }

  constructor(private backend: SupabaseService, private router: Router) {}

  ngOnInit(): void {
    this.initTheme();
    this.initLang();
    // AuthGuard guarantees we have a session — load CV docs straight away.
    this.loadCvDocs();
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---- Theme -----------------------------------------------------------
  private initTheme(): void {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('theme');
    const prefersDark =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDark = saved ? saved === 'dark' : prefersDark;
    this.applyTheme();
  }

  private applyTheme(): void {
    const root = document.documentElement;
    if (this.isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    this.applyTheme();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    }
  }

  // ---- Language --------------------------------------------------------
  private initLang(): void {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved === 'en' || saved === 'fr') {
      this.lang = saved;
    } else {
      const navLang = (navigator?.language || '').toLowerCase();
      this.lang = navLang.startsWith('fr') ? 'fr' : 'en';
    }
    document.documentElement.setAttribute('lang', this.lang);
  }

  setLang(l: Lang): void {
    if (this.lang === l) return;
    this.lang = l;
    document.documentElement.setAttribute('lang', l);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lang', l);
    }
  }

  setEditorLang(l: CvLang): void {
    this.editorLang = l;
  }

  // ---- Toast helpers ---------------------------------------------------
  private showSuccess(msg: string): void {
    this.successMessage = msg;
    this.errorMessage = '';
    this.scheduleDismiss();
  }
  private showError(msg: string): void {
    this.errorMessage = msg;
    this.successMessage = '';
    this.scheduleDismiss();
  }
  closeToast(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    this.successMessage = '';
    this.errorMessage = '';
  }
  private scheduleDismiss(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }

  // ---- Logout ----------------------------------------------------------
  async logout(): Promise<void> {
    try {
      await this.backend.logout();
    } catch (err) {
      console.warn('logout warning', err);
    }
    this.isAuthenticated = false;
    this.slots = { en: emptySlot('en'), fr: emptySlot('fr') };
    this.structured = { en: emptyStructuredForm(), fr: emptyStructuredForm() };
    this.router.navigate(['/login']);
  }

  // ---- Loading existing CV docs ---------------------------------------
  private loadCvDocs(): void {
    (['en', 'fr'] as CvLang[]).forEach((lang) => {
      this.backend.getCvDoc(lang)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (cv) => this.applyCvDoc(lang, cv),
          error: (err) => console.error(`Failed to load CV ${lang}:`, err)
        });
    });
  }

  private applyCvDoc(lang: CvLang, cv: CvDoc | null): void {
    if (!cv) return;
    if (cv.file) {
      this.slots[lang].fileName = cv.file.fileName;
      this.slots[lang].fileSize = cv.file.size;
      this.slots[lang].downloadUrl = cv.file.pdfUrl;
    }
    if (cv.structured) {
      const s = cv.structured;
      this.structured[lang] = {
        fullName: s.fullName ?? '',
        title: s.title ?? '',
        summary: s.summary ?? '',
        email: s.email ?? '',
        phone: s.phone ?? '',
        location: s.location ?? '',
        experience: (s.experience ?? []).map((e) => ({ ...e })),
        education: (s.education ?? []).map((e) => ({ ...e })),
        skills: (s.skills ?? []).join(', ')
      };
    }
  }

  // ---- File upload (per language) -------------------------------------
  onDragOver(e: DragEvent, lang: CvLang) {
    e.preventDefault();
    e.stopPropagation();
    this.slots[lang].isDragging = true;
  }
  onDragLeave(e: DragEvent, lang: CvLang) {
    e.preventDefault();
    e.stopPropagation();
    this.slots[lang].isDragging = false;
  }
  onDrop(e: DragEvent, lang: CvLang) {
    e.preventDefault();
    e.stopPropagation();
    this.slots[lang].isDragging = false;
    if (!this.isAuthenticated) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.handleFile(file, lang);
  }

  onFile(event: Event, lang: CvLang) {
    if (!this.isAuthenticated) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file, lang);
    if (input) input.value = '';
  }

  private handleFile(file: File, lang: CvLang) {
    if (file.type !== 'application/pdf') {
      this.showError(this.t('upload.error.notpdf'));
      return;
    }

    const slot = this.slots[lang];
    slot.fileName = file.name;
    slot.fileSize = file.size;
    slot.uploadProgress = 0;

    const pdfPath = `cv-${lang}.pdf`;

    // Use the per-upload Observable's own completion event so EN and FR
    // uploads in parallel never trigger each other's "upload complete" path.
    this.backend.uploadFile(lang, file).subscribe({
      next: (progress) => {
        slot.uploadProgress = progress ?? 0;
      },
      error: (error) => {
        console.error(`Upload failed for ${lang}:`, error);
        slot.uploadProgress = null;
        this.showError(`${this.t('upload.error.generic')}: ${error?.message || ''}`);
      },
      complete: () => {
        // Upload finished — get the public file-view URL and persist meta.
        try {
          const url = this.backend.getDownloadUrl(lang);
          slot.downloadUrl = url;
          slot.uploadProgress = null;

          this.backend
            .saveCvFileMeta(lang, {
              pdfPath,
              pdfUrl: url,
              fileName: file.name,
              size: file.size
            })
            .then(() => {
              this.showSuccess(this.t('upload.success'));
            })
            .catch((err) => {
              console.error('Failed to save file meta to Supabase:', err);
              this.showError(this.t('upload.error.generic'));
            });
        } catch (err: any) {
          console.error('Failed to get download URL:', err);
          slot.uploadProgress = null;
          this.showError(this.t('upload.error.generic'));
        }
      }
    });
  }

  formatSize(bytes: number | null): string {
    if (bytes == null) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  testDownload(lang: CvLang) {
    if (!this.isAuthenticated) return;
    const slot = this.slots[lang];
    if (slot.downloadUrl) {
      window.open(slot.downloadUrl, '_blank');
    } else {
      this.showError('No CV available to download');
    }
  }

  copyLink(lang: CvLang) {
    const slot = this.slots[lang];
    if (!slot.downloadUrl) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(slot.downloadUrl).then(() => {
        this.showSuccess(this.t('actions.copied'));
      });
    }
  }

  // ---- Structured editor ----------------------------------------------
  addExperience(lang: CvLang) {
    this.structured[lang].experience.push({ date: '', role: '', company: '', description: '' });
  }
  removeExperience(lang: CvLang, idx: number) {
    this.structured[lang].experience.splice(idx, 1);
  }
  addEducation(lang: CvLang) {
    this.structured[lang].education.push({ date: '', role: '', school: '' });
  }
  removeEducation(lang: CvLang, idx: number) {
    this.structured[lang].education.splice(idx, 1);
  }

  /** Used in *ngFor for stable DOM as user types into rows. */
  trackByIndex(i: number) { return i; }

  saveStructured(lang: CvLang) {
    if (!this.isAuthenticated) return;
    const form = this.structured[lang];
    const payload: CvStructured = {
      fullName: form.fullName.trim() || undefined,
      title: form.title.trim() || undefined,
      summary: form.summary.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      location: form.location.trim() || undefined,
      experience: form.experience
        .filter((e) => (e.role || '').trim() || (e.company || '').trim() || (e.date || '').trim())
        .map((e) => ({
          date: (e.date || '').trim(),
          role: (e.role || '').trim(),
          company: (e.company || '').trim() || undefined,
          description: (e.description || '').trim() || undefined
        })),
      education: form.education
        .filter((e) => (e.role || '').trim() || (e.school || '').trim())
        .map((e) => ({
          date: (e.date || '').trim() || undefined,
          role: (e.role || '').trim(),
          school: (e.school || '').trim()
        })),
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    };

    this.savingStructured[lang] = true;
    this.backend.saveCvStructured(lang, payload)
      .then(() => {
        this.showSuccess(this.t('structured.saved'));
      })
      .catch((err) => {
        console.error('Failed to save structured CV:', err);
        this.showError(`${this.t('upload.error.generic')}: ${err?.message || ''}`);
      })
      .finally(() => {
        this.savingStructured[lang] = false;
      });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
