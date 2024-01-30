import { Component, OnInit } from '@angular/core';
import { DownloadService } from 'src/assets/download.service';
import Typed from 'typed.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private downloadService: DownloadService) {}
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
    const cvUrl = '../../assets/cv/Mourad_Tizougarine.pdf';

    this.downloadService.downloadFile(cvUrl);




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
