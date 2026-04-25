import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { DownloadService } from 'src/assets/download.service';
import { CvService } from '../cv.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import emailjs from 'emailjs-com';

type Lang = 'en' | 'fr';
type Dict = { [key: string]: string };

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading = false;
  downloading = false;

  // Theme
  isDark = false;

  // Language
  lang: Lang = 'en';

  // Contact form (lives on the single-page home now)
  contactForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  private destroy$ = new Subject<void>();
  private toastTimer: any = null;

  // ---- Translations -----------------------------------------------------
  private tx: { en: Dict; fr: Dict } = {
    en: {
      // top bar
      'status.available': 'Available for new projects',
      'status.location': 'Casablanca, MA',

      // about
      'about.label': 'About me',
      'about.role': 'Front-End & Full-Stack Developer',
      'about.bio.1': 'Casablanca-based engineer',
      'about.bio.italic': 'on a mission',
      'about.bio.2': 'to build modern, scalable, and user-focused web & mobile apps. Passionate about clean code, performance, and delivering high-quality digital solutions.',
      'about.terminal.role': 'role',
      'about.terminal.role.value': 'front-end & full-stack engineer',
      'about.terminal.stack': 'stack',
      'about.terminal.status': 'status',
      'about.terminal.status.value': 'shipping →',
      'about.stat.exp': 'Years of experience',
      'about.stat.proj': 'Projects shipped',
      'about.stat.lang': 'Languages spoken',
      'about.cv.download': 'Download CV',
      'about.cv.preparing': 'Preparing…',
      'about.cta.talk': "Let's talk",

      // strengths
      'strengths.label': 'Strengths',
      'strengths.title.what': "What I'm",
      'strengths.title.italic': 'good at',
      'strengths.subtitle': "From pixels to pipelines, I'll make your digital dreams ship.",
      'strengths.1.title': 'Mobile Development',
      'strengths.1.desc': 'Cross-platform mobile apps with React Native — scalable UI components, smooth interactions, and seamless API integrations.',
      'strengths.2.title': 'Full-Stack Web Development',
      'strengths.2.desc': 'React.js, Angular, and Laravel — from responsive interfaces to secure auth systems and optimized MySQL/PostgreSQL databases.',
      'strengths.3.title': 'RESTful API Integration',
      'strengths.3.desc': 'Designing and consuming REST APIs with proper state management, error handling, and authentication flows.',
      'strengths.4.title': 'Agile Collaboration',
      'strengths.4.desc': 'Comfortable in Scrum/Kanban teams — close collaboration with designers and back-end developers, clear async communication.',
      'strengths.5.title': 'Performance & Quality',
      'strengths.5.desc': 'Clean code, performance optimization, and deployment monitoring — making sure shipped apps stay fast and reliable.',

      // stack
      'stack.label': 'My toolkit',
      'stack.title.trusted': 'Trusted',
      'stack.title.italic': 'stack',

      // resume
      'resume.label': 'Resume',
      'resume.title.education': 'Education &',
      'resume.title.italic': 'experience',
      'resume.subtitle': 'The dynamic duo that turned me into the engineer I am today.',
      'resume.education': 'EDUCATION',
      'resume.experience': 'EXPERIENCE',
      'resume.edu.1.role': "Professional Bachelor's · Web & Mobile Development",
      'resume.edu.1.school': 'Faculty of Sciences Ain Chock — Casablanca',
      'resume.edu.2.role': 'Specialized Technician · Software Development',
      'resume.edu.2.school': 'NTIC2 Sidi Maârouf (ISTA) — Morocco',
      'resume.exp.1.date': 'Jan 2026 – Present',
      'resume.exp.1.role': 'Front-End Developer · React Native',
      'resume.exp.2.date': 'Sept 2024 – Dec 2025',
      'resume.exp.2.role': 'Full-Stack Developer',
      'resume.exp.3.date': 'Jun 2023 – Sept 2023',
      'resume.exp.3.role': 'Front-End Web Developer Intern',

      // employers
      'employers.label': 'My awesome employers',
      'employers.title.companies': "Companies I've",
      'employers.title.italic': 'worked with',

      // projects
      'projects.label': 'Selected work',
      'projects.title.selected': 'Selected',
      'projects.title.italic': 'projects',
      'projects.subtitle': 'A handful of recent builds — from side projects to client work.',
      'projects.visit': 'Visit',
      'projects.1.title': 'Movie Scope',
      'projects.1.desc': 'Movie discovery app built with Angular and the TMDB API.',
      'projects.2.title': 'Business Website',
      'projects.2.desc': 'UX/UI marketing site — pure HTML & CSS, mobile-first.',
      'projects.3.title': 'Budget Management Platform',
      'projects.3.desc': 'SDG-aligned budget tracking dashboard for ministries & regions.',
      'projects.4.title': 'E-commerce Website',
      'projects.4.desc': 'Full e-commerce flow with cart, checkout, and admin dashboard.',

      // contact
      'contact.label': 'Get in touch',
      'contact.title.lets': "Let's",
      'contact.title.italic': 'connect',
      'contact.subtitle': 'Tell me about your idea, budget, and timeline. I typically reply within 24 hours.',
      'contact.field.name': 'Name',
      'contact.field.name.ph': 'Your name',
      'contact.field.email': 'E-mail',
      'contact.field.email.ph': 'you@company.com',
      'contact.field.subject': 'Subject',
      'contact.field.subject.ph': "What's this about?",
      'contact.field.message': 'Message',
      'contact.field.message.ph': 'Tell me about your project…',
      'contact.reply': 'I typically reply within 24h',
      'contact.send': 'Send message',
      'contact.sending': 'Sending…',

      // toast
      'toast.success.label': 'Message sent',
      'toast.success.title.1': 'Thanks — your message is',
      'toast.success.title.italic': 'on its way',
      'toast.success.sub': 'I typically reply within 24 hours. Looking forward to chatting.',
      'toast.error.label': 'Something broke',
      'toast.error.title.1': "Hmm — that didn't",
      'toast.error.title.italic': 'go through',
      'toast.close': 'Close',
      'toast.email.direct': 'Email me directly',

      // footer
      'footer.copy': '© 2026 Mourad Tizougarine · Designed & developed in Casablanca',
      'footer.top': '↑ Back to top',
    },
    fr: {
      // top bar
      'status.available': 'Disponible pour de nouveaux projets',
      'status.location': 'Casablanca, MA',

      // about
      'about.label': 'À propos',
      'about.role': 'Développeur Front-End & Full-Stack',
      'about.bio.1': 'Ingénieur basé à Casablanca,',
      'about.bio.italic': 'en mission',
      'about.bio.2': "pour bâtir des applications web et mobiles modernes, performantes et centrées sur l'utilisateur. Passionné par le code propre, la performance et la livraison de solutions numériques de qualité.",
      'about.terminal.role': 'rôle',
      'about.terminal.role.value': 'ingénieur front-end & full-stack',
      'about.terminal.stack': 'stack',
      'about.terminal.status': 'statut',
      'about.terminal.status.value': 'en production →',
      'about.stat.exp': "Années d'expérience",
      'about.stat.proj': 'Projets livrés',
      'about.stat.lang': 'Langues parlées',
      'about.cv.download': 'Télécharger le CV',
      'about.cv.preparing': 'Préparation…',
      'about.cta.talk': 'Discutons',

      // strengths
      'strengths.label': 'Compétences',
      'strengths.title.what': 'Ce que je fais',
      'strengths.title.italic': 'le mieux',
      'strengths.subtitle': 'Du pixel au pipeline, je donne vie à vos idées numériques.',
      'strengths.1.title': 'Développement mobile',
      'strengths.1.desc': "Applications mobiles cross-platform avec React Native — composants UI évolutifs, interactions fluides et intégrations API sans accroc.",
      'strengths.2.title': 'Développement web full-stack',
      'strengths.2.desc': "React.js, Angular et Laravel — des interfaces responsives aux systèmes d'authentification sécurisés et bases de données MySQL/PostgreSQL optimisées.",
      'strengths.3.title': 'Intégration d’API REST',
      'strengths.3.desc': "Conception et consommation d'API REST avec gestion d'état, traitement des erreurs et flux d'authentification soignés.",
      'strengths.4.title': 'Collaboration agile',
      'strengths.4.desc': 'À l’aise en Scrum/Kanban — collaboration étroite avec les designers et développeurs back-end, communication asynchrone claire.',
      'strengths.5.title': 'Performance & qualité',
      'strengths.5.desc': 'Code propre, optimisation des performances et monitoring du déploiement — pour des applis rapides et fiables sur la durée.',

      // stack
      'stack.label': 'Ma boîte à outils',
      'stack.title.trusted': 'Stack',
      'stack.title.italic': 'éprouvée',

      // resume
      'resume.label': 'Parcours',
      'resume.title.education': 'Formation &',
      'resume.title.italic': 'expérience',
      'resume.subtitle': "Le duo dynamique qui a fait de moi l'ingénieur que je suis aujourd'hui.",
      'resume.education': 'FORMATION',
      'resume.experience': 'EXPÉRIENCE',
      'resume.edu.1.role': 'Licence professionnelle · Développement web & mobile',
      'resume.edu.1.school': 'Faculté des Sciences Aïn Chock — Casablanca',
      'resume.edu.2.role': 'Technicien spécialisé · Développement de logiciels',
      'resume.edu.2.school': 'NTIC2 Sidi Maârouf (ISTA) — Maroc',
      'resume.exp.1.date': 'Jan 2026 – Présent',
      'resume.exp.1.role': 'Développeur front-end · React Native',
      'resume.exp.2.date': 'Sept 2024 – Déc 2025',
      'resume.exp.2.role': 'Développeur full-stack',
      'resume.exp.3.date': 'Juin 2023 – Sept 2023',
      'resume.exp.3.role': 'Stagiaire développeur web front-end',

      // employers
      'employers.label': 'Mes employeurs',
      'employers.title.companies': 'Entreprises avec qui',
      'employers.title.italic': "j'ai travaillé",

      // projects
      'projects.label': 'Travaux sélectionnés',
      'projects.title.selected': 'Projets',
      'projects.title.italic': 'sélectionnés',
      'projects.subtitle': 'Quelques réalisations récentes — projets perso et missions clients.',
      'projects.visit': 'Voir',
      'projects.1.title': 'Movie Scope',
      'projects.1.desc': "Application de découverte de films, construite avec Angular et l'API TMDB.",
      'projects.2.title': "Site d'entreprise",
      'projects.2.desc': 'Site marketing UX/UI — pur HTML & CSS, mobile-first.',
      'projects.3.title': 'Plateforme de gestion budgétaire',
      'projects.3.desc': 'Tableau de bord de suivi budgétaire aligné sur les ODD pour ministères & régions.',
      'projects.4.title': 'Site e-commerce',
      'projects.4.desc': 'Parcours e-commerce complet : panier, paiement et tableau de bord admin.',

      // contact
      'contact.label': 'Me contacter',
      'contact.title.lets': 'Restons',
      'contact.title.italic': 'en contact',
      'contact.subtitle': 'Parlez-moi de votre idée, votre budget et vos délais. Je réponds généralement sous 24 heures.',
      'contact.field.name': 'Nom',
      'contact.field.name.ph': 'Votre nom',
      'contact.field.email': 'E-mail',
      'contact.field.email.ph': 'vous@entreprise.com',
      'contact.field.subject': 'Sujet',
      'contact.field.subject.ph': "De quoi s'agit-il ?",
      'contact.field.message': 'Message',
      'contact.field.message.ph': 'Parlez-moi de votre projet…',
      'contact.reply': 'Je réponds généralement sous 24 h',
      'contact.send': 'Envoyer',
      'contact.sending': 'Envoi…',

      // toast
      'toast.success.label': 'Message envoyé',
      'toast.success.title.1': 'Merci — votre message est',
      'toast.success.title.italic': 'en route',
      'toast.success.sub': 'Je réponds généralement sous 24 heures. Au plaisir d’échanger.',
      'toast.error.label': 'Oups, problème',
      'toast.error.title.1': "Hmm — ça n'est pas",
      'toast.error.title.italic': 'passé',
      'toast.close': 'Fermer',
      'toast.email.direct': 'Écrivez-moi directement',

      // footer
      'footer.copy': '© 2026 Mourad Tizougarine · Conçu & développé à Casablanca',
      'footer.top': '↑ Retour en haut',
    },
  };

  /** Translate a key against the current language. */
  t(key: string): string {
    const dict = this.tx[this.lang] || this.tx.en;
    return dict[key] ?? this.tx.en[key] ?? key;
  }

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
    this.initTheme();
    this.initLang();
    this.setupNavigationLoading();
  }

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
    if (this.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
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
    this.applyLang();
  }

  private applyLang(): void {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('lang', this.lang);
    }
  }

  setLang(l: Lang): void {
    if (this.lang === l) return;
    this.lang = l;
    this.applyLang();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lang', l);
    }
  }

  ngAfterViewInit(): void {
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
      time: new Date().toLocaleString(this.lang === 'fr' ? 'fr-FR' : 'en-US', {
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
      this.successMessage = this.t('toast.success.label');
      this.contactForm.reset();
      this.scheduleToastDismiss();
    })
    .catch(() => {
      this.errorMessage = this.t('toast.error.label');
      this.scheduleToastDismiss();
    })
    .finally(() => {
      this.loading = false;
    });
  }

  closeToast(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    this.successMessage = '';
    this.errorMessage = '';
  }

  private scheduleToastDismiss(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 6000);
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.destroy$.next();
    this.destroy$.complete();
  }
}
