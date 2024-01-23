import { Component } from '@angular/core';
import { DownloadService } from 'src/assets/download.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  constructor(private downloadService: DownloadService) {}

  downloadCV(): void {
    const cvUrl = '../../assets/cv/Mourad_Tizougarine.pdf';
    this.downloadService.downloadFile(cvUrl);
  }
}
