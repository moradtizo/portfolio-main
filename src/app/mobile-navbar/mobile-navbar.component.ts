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
    // Initial check on component load
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.showNavbar = window.innerWidth <= 768; // Adjust the threshold as needed
  }
}
