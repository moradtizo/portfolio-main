import { Component } from '@angular/core';
import { CvService } from '../cv.service';
import { DownloadService } from 'src/assets/download.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  cvUrl: string;

  constructor(private cv: CvService, private downloader: DownloadService) {
    this.cvUrl = this.cv.url;
  }

  async onFile(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }
    await this.cv.setFile(file);
    alert('CV PDF stored in browser');
  }

  save() {
    const trimmed = (this.cvUrl || '').trim();
    if (!trimmed) return;
    this.cv.setUrl(trimmed);
    alert('CV URL saved');
  }

  async reset() {
    await this.cv.reset();
    this.cvUrl = this.cv.url;
  }

  async testDownload() {
    if (this.cv.mode === 'file') {
      const file = await this.cv.getFile();
      if (file) {
        this.downloader.downloadBlob(file.blob, file.name || 'cv.pdf');
        return;
      }
    }
    this.downloader.downloadFile(this.cv.url);
  }
}
