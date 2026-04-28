
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SharedService } from './shared.service';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
const SHOW_BOTTOM_NAVBAR_KEY = 'showBottomNavbar';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('devCursor') devCursor?: ElementRef<HTMLDivElement>;
  private cursorTeardown: (() => void) | null = null;

  constructor(
    private sharedService: SharedService,
    private router: Router,
    private zone: NgZone
  ) {// Retrieve the state from localStorage
    const storedState = localStorage.getItem(SHOW_BOTTOM_NAVBAR_KEY);
    this.showBottomNavbar = storedState ? JSON.parse(storedState) : false;}
  title = 'portfolio';
  isLoading: boolean = false;
  ngOnInit(): void {
    initFlowbite();
    this.sharedService.showSidebar$.subscribe((value) => {
      this.showSidebar = value;
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      } else if (event instanceof NavigationEnd) {        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initDevCursor();
  }

  ngOnDestroy(): void {
    if (this.cursorTeardown) this.cursorTeardown();
  }

  /**
   * Dev-styled hover hint. Native cursor stays visible everywhere; a small
   * floating label ("click", "open", "type"...) follows the mouse with a
   * gentle ease, but only appears while the pointer is over an interactive
   * element. Skipped on touch / coarse-pointer devices.
   */
  private initDevCursor(): void {
    const el = this.devCursor?.nativeElement;
    if (!el || typeof window === 'undefined') return;

    const isCoarse =
      window.matchMedia &&
      window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (isCoarse) {
      el.style.display = 'none';
      return;
    }

    const labelEl = el.querySelector('.dev-cursor__text') as HTMLElement | null;

    this.zone.runOutsideAngular(() => {
      let targetX = window.innerWidth / 2;
      let targetY = window.innerHeight / 2;
      let curX = targetX;
      let curY = targetY;
      let raf = 0;
      let lastLabel = '';

      const interactiveSel =
        'a, button, input, textarea, select, label, [role="button"], [contenteditable="true"], .clickable';

      // Map a hovered element to a short dev-flavored label.
      const labelFor = (node: Element): string => {
        const tag = node.tagName.toLowerCase();
        if (tag === 'a') return 'open';
        if (tag === 'button') return 'click';
        if (tag === 'input') {
          const type = (node as HTMLInputElement).type || 'text';
          if (type === 'checkbox' || type === 'radio') return 'toggle';
          if (type === 'file') return 'upload';
          if (type === 'submit') return 'submit';
          return 'type';
        }
        if (tag === 'textarea' || (node as HTMLElement).isContentEditable) return 'type';
        if (tag === 'select') return 'choose';
        if (tag === 'label') return 'click';
        const role = node.getAttribute('role');
        if (role === 'button') return 'click';
        return 'click';
      };

      // Tiny debounce on the "leave" side so moving between two adjacent
      // buttons / links doesn't make the label flicker off-and-on.
      let hideTimer: ReturnType<typeof setTimeout> | null = null;
      const cancelHide = () => {
        if (hideTimer !== null) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
      };

      const onMove = (e: MouseEvent) => {
        targetX = e.clientX;
        targetY = e.clientY;
        const t = e.target as Element | null;
        const hit = t && t.closest ? t.closest(interactiveSel) as Element | null : null;
        if (hit) {
          cancelHide();
          const next = labelFor(hit);
          if (labelEl && next !== lastLabel) {
            labelEl.textContent = next;
            lastLabel = next;
          }
          el.classList.add('dev-cursor--active');
        } else if (el.classList.contains('dev-cursor--active') && hideTimer === null) {
          hideTimer = setTimeout(() => {
            el.classList.remove('dev-cursor--active');
            hideTimer = null;
          }, 120);
        }
      };
      const onLeave = () => {
        cancelHide();
        el.classList.remove('dev-cursor--active');
      };

      const tick = () => {
        // Locked to the cursor — no easing, no trailing motion.
        // Offset slightly down-right of the cursor tip so the label never
        // covers the link or text the user is reading.
        el.style.transform = `translate3d(${targetX + 16}px, ${targetY + 18}px, 0)`;
        raf = requestAnimationFrame(tick);
      };

      document.addEventListener('mousemove', onMove, { passive: true });
      document.addEventListener('mouseleave', onLeave);
      raf = requestAnimationFrame(tick);

      this.cursorTeardown = () => {
        cancelAnimationFrame(raf);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseleave', onLeave);
      };
    });
  }
  showSidebar: boolean = true;





  // Function to refresh the current route
  refreshCurrentRoute(): void {
    const currentRoute = this.router.url;
    this.router.navigate([currentRoute]);
  }
  showBottomNavbar = false;



  // Listen for window resize events
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Update the state and store it in localStorage
    this.showBottomNavbar = window.innerWidth < 640;
    localStorage.setItem(SHOW_BOTTOM_NAVBAR_KEY, JSON.stringify(this.showBottomNavbar));
  }
}

