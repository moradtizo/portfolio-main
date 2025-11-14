import { Component, OnDestroy } from '@angular/core';
import { FirebaseService } from '../firebase.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnDestroy {
  isAuthenticated = false;
  username = '';
  password = '';
  isLoading = false;
  uploadProgress: number | null = null;
  downloadUrl: string | null = null;
  uploadError: string | null = null;

  private readonly validUsername = 'admin'; // Replace with your username
  private readonly validPassword = 'password123'; // Replace with your password
  private destroy$ = new Subject<void>();

  constructor(private firebaseService: FirebaseService) {
    // Check if user was previously authenticated
    this.isAuthenticated = sessionStorage.getItem('isAdmin') === 'true';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  onFile(event: Event) {
    if (!this.isAuthenticated) return;

    try {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];

      if (!file) {
        alert('No file selected');
        return;
      }
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
      }

      const filePath = `cvs/${file.name}`;
      this.uploadProgress = 0;

      console.log('Starting file upload:', filePath);

      // Monitor upload progress
      const uploadSubscription = this.firebaseService.uploadFile(filePath, file).subscribe(
        progress => {
          this.uploadProgress = progress || 0;
          console.log('Upload progress:', progress);
        },
        error => {
          console.error('Upload error:', error);
          this.uploadProgress = null;
          alert(`Upload failed: ${error?.message || 'Unknown error'}`);
        },
        () => {
          console.log('Upload stream completed');
        }
      );

      // Listen for upload completion
      const completeSubscription = this.firebaseService.getUploadComplete().subscribe(
        isComplete => {
          if (isComplete) {
            console.log('Upload complete, retrieving download URL...');
            
            // Get the download URL after upload is complete
            this.firebaseService.getDownloadUrl(filePath).subscribe(
              url => {
                this.downloadUrl = url;
                this.uploadProgress = null;
                console.log('Download URL retrieved:', url);
                alert('CV uploaded successfully! ✅');
              },
              error => {
                console.error('Failed to get download URL:', error);
                this.uploadProgress = null;
                alert('File uploaded but could not retrieve download URL. Check console for details.');
              }
            );
            
            completeSubscription.unsubscribe();
          }
        }
      );
    } catch (error) {
      console.error('File upload failed:', error);
      this.uploadProgress = null;
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testDownload() {
    if (!this.isAuthenticated) return;

    try {
      if (this.downloadUrl) {
        window.open(this.downloadUrl, '_blank');
      } else {
        alert('No CV available for download');
      }
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