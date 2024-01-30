import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  showSidebar = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  ngOnInit() {
    // Initial check on component load
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.showSidebar = window.innerWidth > 768; // Adjust the threshold as needed
  }
}
