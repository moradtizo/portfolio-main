// download.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  downloadFile(fileUrl: string, suggestedName?: string): void {
    const link = document.createElement('a');
    link.href = fileUrl;
    const nameFromUrl = fileUrl.split('/').pop() || 'download.pdf';
    link.download = suggestedName || nameFromUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}
