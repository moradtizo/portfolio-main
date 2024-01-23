import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  showSidebar: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.showSidebar = this.route.snapshot.data['fullPage'] !== true;

    // If you want to communicate this change to other components, update the shared service
    this.sharedService.setShowSidebar(this.showSidebar);
  }
}
