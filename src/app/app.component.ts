
import { Component,HostListener,OnInit,ViewEncapsulation } from '@angular/core';
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
export class AppComponent implements OnInit{
  constructor(private sharedService: SharedService,private router: Router) {// Retrieve the state from localStorage
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
