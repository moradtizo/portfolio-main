
import { Component,OnInit,ViewEncapsulation } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { SharedService } from './shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit{
  constructor(private sharedService: SharedService,private router: Router) {}
  title = 'portfolio';
  ngOnInit(): void {
    initFlowbite();
    this.sharedService.showSidebar$.subscribe((value) => {
      this.showSidebar = value;
    });
  }
  showSidebar: boolean = true;





  // Function to refresh the current route
  refreshCurrentRoute(): void {
    const currentRoute = this.router.url;
    this.router.navigate([currentRoute]);
  }
}
