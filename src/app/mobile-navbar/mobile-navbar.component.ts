import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-mobile-navbar',
  templateUrl: './mobile-navbar.component.html',
  styleUrls: ['./mobile-navbar.component.scss']
})
export class MobileNavbarComponent implements OnInit{
  showNavbar = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  ngOnInit() {
    // Dark-first portfolio: default to dark unless the user has explicitly chosen light.
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.isDarkMode = false;
      document.documentElement.classList.remove('dark');
    } else {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    }
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.showNavbar = window.innerWidth <= 768; // Adjust the threshold as needed
  }

  isDarkMode = false;

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');  // save to localStorage
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light'); // save to localStorage
    }
  }
}
