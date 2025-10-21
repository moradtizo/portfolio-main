import { Component } from '@angular/core';
import { CvService } from '../cv.service';
import { DownloadService } from 'src/assets/download.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  isAuthenticated = false;
  username = '';
  password = '';
  isLoading = false;

  private readonly validUsername = 'admin'; // Replace with your username
  private readonly validPassword = 'password123'; // Replace with your password

  constructor(private cv: CvService, private downloader: DownloadService) {
    // Check if user was previously authenticated
    this.isAuthenticated = sessionStorage.getItem('isAdmin') === 'true';
  }

  async login() {
    try {
      this.isLoading = true;
      if (this.username === this.validUsername && this.password === this.validPassword) {
        this.isAuthenticated = true;
        sessionStorage.setItem('isAdmin', 'true');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Invalid username or password');
    } finally {
      this.isLoading = false;
    }
  }

  async onFile(evt: Event) {
    if (!this.isAuthenticated) return;

    try {
      const input = evt.target as HTMLInputElement;
      const file = input.files?.[0];

      if (!file) throw new Error('No file selected');
      if (file.type !== 'application/pdf') throw new Error('Please select a PDF file');

      await this.cv.reset();
      await this.cv.setFile(file);
      alert('CV PDF successfully uploaded and stored');
    } catch (error) {
      console.error('File upload failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload file');
    }
  }

  async testDownload() {
    if (!this.isAuthenticated) return;

    try {
      if (this.cv.mode === 'file') {
        const file = await this.cv.getFile();
        if (!file) throw new Error('No file available');

        this.downloader.downloadBlob(file.blob, file.name || 'cv.pdf');
        return;
      }
      this.downloader.downloadFile(this.cv.url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download CV');
    }
  }

  logout() {
    this.isAuthenticated = false;
    this.username = '';
    this.password = '';
    sessionStorage.removeItem('isAdmin');
    alert('Logged out successfully');
  }
}