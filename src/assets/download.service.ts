// download.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  downloadFile(fileUrl: string): void {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'Mourad_Tizougarine.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
