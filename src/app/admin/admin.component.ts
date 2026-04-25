import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../firebase.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type Lang = 'en' | 'fr';
type Dict = { [key: string]: string };

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  username = '';
  password = '';
  showPassword = false;
  isLoading = false;

  // Upload state
  uploadProgress: number | null = null;
  downloadUrl: string | null = null;
  currentFileName: string | null = null;
  currentFileSize: number | null = null;
  isDragging = false;

  // Status toast
  successMessage = '';
  errorMessage = '';
  private toastTimer: any = null;

  // Theme + Language (shared with home via localStorage)
  isDark = false;
  lang: Lang = 'en';

  private readonly validUsername = 'admin';
  private readonly validPassword = 'password123';
  private destroy$ = new Subject<void>();

  // ---- Translations -----------------------------------------------------
  private tx: { en: Dict; fr: Dict } = {
    en: {
      'panel.label': 'Admin panel',
      'panel.title.cv': 'CV',
      'panel.title.italic': 'management',
      'panel.subtitle': 'Manage the CV used by the public portfolio. Upload a new PDF or download the current one.',

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

      'upload.label': 'Upload PDF',
      'upload.title': 'New CV',
      'upload.dropzone.title': 'Click to upload or drag a file here',
      'upload.dropzone.sub': 'PDF only · Max 10 MB',
      'upload.uploading': 'Uploading',
      'upload.success': 'CV uploaded successfully',
      'upload.error.notpdf': 'Please select a PDF file',
      'upload.error.nofile': 'No file selected',
      'upload.error.generic': 'Upload failed',
      'upload.current': 'Current file',
      'upload.size': 'Size',

      'actions.download': 'Download current CV',
      'actions.logout': 'Logout',
      'actions.viewsite': 'View site',
      'actions.copy': 'Copy link',
      'actions.copied': 'Link copied!',

      'footer.back': '← Back to portfolio',
    },
    fr: {
      'panel.label': 'Panneau admin',
      'panel.title.cv': 'Gestion du',
      'panel.title.italic': 'CV',
      'panel.subtitle': 'Gérez le CV utilisé par le portfolio public. Téléversez un nouveau PDF ou téléchargez le courant.',

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

      'upload.label': 'Téléverser un PDF',
      'upload.title': 'Nouveau CV',
      'upload.dropzone.title': 'Cliquez pour téléverser ou déposez un fichier ici',
      'upload.dropzone.sub': 'PDF uniquement · Max 10 Mo',
      'upload.uploading': 'Téléversement',
      'upload.success': 'CV téléversé avec succès',
      'upload.error.notpdf': 'Veuillez sélectionner un fichier PDF',
      'upload.error.nofile': 'Aucun fichier sélectionné',
      'upload.error.generic': 'Échec du téléversement',
      'upload.current': 'Fichier actuel',
      'upload.size': 'Taille',

      'actions.download': 'Télécharger le CV actuel',
      'actions.logout': 'Déconnexion',
      'actions.viewsite': 'Voir le site',
      'actions.copy': 'Copier le lien',
      'actions.copied': 'Lien copié !',

      'footer.back': '← Retour au portfolio',
    },
  };

  t(key: string): string {
    const dict = this.tx[this.lang] || this.tx.en;
    return dict[key] ?? this.tx.en[key] ?? key;
  }

  constructor(private firebaseService: FirebaseService, private router: Router) {
    this.isAuthenticated = sessionStorage.getItem('isAdmin') === 'true';
  }

  ngOnInit(): void {
    this.initTheme();
    this.initLang();
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

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // ---- Login -----------------------------------------------------------
  async login() {
    try {
      this.isLoading = true;
      // tiny delay so the spinner reads as "actually doing something"
      await new Promise(r => setTimeout(r, 350));
      if (this.username === this.validUsername && this.password === this.validPassword) {
        this.isAuthenticated = true;
        sessionStorage.setItem('isAdmin', 'true');
        this.password = '';
      } else {
        this.showError(this.t('login.invalid'));
      }
    } finally {
      this.isLoading = false;
    }
  }

  logout() {
    this.isAuthenticated = false;
    this.username = '';
    this.password = '';
    this.downloadUrl = null;
    this.currentFileName = null;
    this.currentFileSize = null;
    sessionStorage.removeItem('isAdmin');
  }

  // ---- File upload ----------------------------------------------------
  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = true;
  }
  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = false;
  }
  onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = false;
    if (!this.isAuthenticated) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  onFile(event: Event) {
    if (!this.isAuthenticated) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
    // reset input so the same file can be re-uploaded
    if (input) input.value = '';
  }

  private handleFile(file: File) {
    if (file.type !== 'application/pdf') {
      this.showError(this.t('upload.error.notpdf'));
      return;
    }

    this.currentFileName = file.name;
    this.currentFileSize = file.size;
    const filePath = `cvs/${file.name}`;
    this.uploadProgress = 0;

    this.firebaseService.uploadFile(filePath, file).subscribe(
      progress => {
        this.uploadProgress = progress || 0;
      },
      error => {
        this.uploadProgress = null;
        this.showError(`${this.t('upload.error.generic')}: ${error?.message || ''}`);
      }
    );

    const completeSub = this.firebaseService.getUploadComplete().subscribe(
      isComplete => {
        if (isComplete) {
          this.firebaseService.getDownloadUrl(filePath).subscribe(
            url => {
              this.downloadUrl = url;
              this.uploadProgress = null;
              this.showSuccess(this.t('upload.success'));
            },
            () => {
              this.uploadProgress = null;
              this.showError(this.t('upload.error.generic'));
            }
          );
          completeSub.unsubscribe();
        }
      }
    );
  }

  formatSize(bytes: number | null): string {
    if (bytes == null) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  testDownload() {
    if (!this.isAuthenticated) return;
    if (this.downloadUrl) {
      window.open(this.downloadUrl, '_blank');
    } else {
      this.showError('No CV available to download');
    }
  }

  copyLink() {
    if (!this.downloadUrl) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(this.downloadUrl).then(() => {
        this.showSuccess(this.t('actions.copied'));
      });
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
