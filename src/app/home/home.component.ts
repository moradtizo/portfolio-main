import { Component, OnInit } from '@angular/core';
import { DownloadService } from 'src/assets/download.service';
import { CvService } from '../cv.service';
import Typed from 'typed.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private downloadService: DownloadService, private cv: CvService) {}
  ngOnInit(): void {
    const options = {
      strings: ['Hi! Im<b>"Mourad"</b>'],
      typeSpeed: 200,
      backSpeed: 50,
      smartBackspace: true, // this is a default
      loop: true
    };
    const typed = new Typed('#typed-text', options);
  }
  downloading = false;

  downloadCV(): void {
    if (this.cv.mode === 'file') {
      this.cv.getFile().then((f) => {
        if (f) this.downloadService.downloadBlob(f.blob, f.name || 'cv.pdf');
        else this.downloadService.downloadFile(this.cv.url);
      });
      return;
    }
    this.downloadService.downloadFile(this.cv.url);
  }





  // downloadCV(): void {
  //   this.downloading = true;

  //   const cvUrl = '../../assets/cv/Mourad_Tizougarine.pdf';

  //   // Simulate a download (replace with your actual download logic)
  //   setTimeout(() => {
  //     this.downloadService.downloadFile(cvUrl);

  //     // After the download is complete, set downloading to false
  //     this.downloading = false;
  //   }, 2000); // Adjust the time according to your actual download time
  // }
}
