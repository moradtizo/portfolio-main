import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { Observable, Subject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private uploadComplete$ = new Subject<boolean>();
  private storage: any;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    try {
      console.log('Initializing Firebase with config:', {
        projectId: environment.firebase.projectId,
        storageBucket: environment.firebase.storageBucket
      });

      // Initialize Firebase app
      const app = initializeApp(environment.firebase);
      
      // Get storage reference
      this.storage = getStorage(app);
      
      console.log('Firebase Storage initialized successfully');
      console.log('Storage bucket:', this.storage.bucket);
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }

  /**
   * Upload a file to Firebase Storage with real-time progress tracking and retry logic
   */
  uploadFile(filePath: string, file: File, retryCount: number = 0): Observable<number | undefined> {
    console.log(`Starting upload: ${filePath}, File size: ${file.size} bytes, Attempt: ${retryCount + 1}`);
    
    return new Observable(observer => {
      try {
        const fileRef = ref(this.storage, filePath);
        
        // Use uploadBytesResumable for progress tracking
        const uploadTask = uploadBytesResumable(fileRef, file, {
          cacheControl: 'public, max-age=3600',
          customMetadata: {
            uploadedAt: new Date().toISOString()
          }
        });

        // Listen for state changes, errors, and completion
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress event
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            console.log(`Upload progress: ${progress}% (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes)`);
            observer.next(progress);
          },
          (error: any) => {
            // Error event with retry logic
            console.error('Upload error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error:', error);

            // Check for CORS issues
            if (error.message && error.message.includes('CORS')) {
              console.error('⚠️ CORS Error detected! You need to configure CORS on Firebase Storage.');
              console.error('Run: gsutil cors set cors.json gs://portflio-9868c.appspot.com');
              observer.error(new Error('CORS Error: Firebase Storage CORS not configured. See console for instructions.'));
              return;
            }

            // Retry logic for specific errors
            if ((error.code === 'storage/retry-limit-exceeded' || error.code === 'storage/network-error') && retryCount < 3) {
              console.log(`Retrying upload... (Attempt ${retryCount + 2}/4)`);
              setTimeout(() => {
                this.uploadFile(filePath, file, retryCount + 1).subscribe(
                  progress => observer.next(progress),
                  err => observer.error(err),
                  () => observer.complete()
                );
              }, 2000 + (retryCount * 1000)); // Exponential backoff
            } else {
              observer.error(error);
            }
          },
          () => {
            // Completion event
            console.log('File uploaded successfully:', uploadTask.snapshot.metadata.name);
            this.uploadComplete$.next(true);
            observer.next(100);
            observer.complete();
          }
        );

      } catch (error) {
        console.error('Upload initialization error:', error);
        observer.error(error);
      }
    });
  }

  /**
   * Get download URL for a file
   */
  getDownloadUrl(filePath: string): Observable<string> {
    console.log(`Retrieving download URL for: ${filePath}`);
    
    return new Observable(observer => {
      try {
        const fileRef = ref(this.storage, filePath);
        
        getDownloadURL(fileRef)
          .then((url) => {
            console.log('Download URL retrieved successfully');
            observer.next(url);
            observer.complete();
          })
          .catch((error) => {
            console.error('Failed to get download URL:', error);
            observer.error(error);
          });
      } catch (error) {
        console.error('Download URL error:', error);
        observer.error(error);
      }
    });
  }

  /**
   * Delete a file from Firebase Storage
   */
  deleteFile(filePath: string): Promise<void> {
    console.log(`Deleting file: ${filePath}`);
    
    try {
      const fileRef = ref(this.storage, filePath);
      return deleteObject(fileRef)
        .then(() => {
          console.log('File deleted successfully');
        })
        .catch((error) => {
          console.error('Delete failed:', error);
          throw error;
        });
    } catch (error) {
      console.error('Delete initialization error:', error);
      return Promise.reject(error);
    }
  }

  /**
   * List files in a directory
   */
  listFiles(path: string): Observable<any> {
    console.log(`Listing files in: ${path}`);
    
    return new Observable(observer => {
      try {
        const dirRef = ref(this.storage, path);
        
        listAll(dirRef)
          .then((result) => {
            console.log('Files listed successfully');
            observer.next(result);
            observer.complete();
          })
          .catch((error) => {
            console.error('List files error:', error);
            observer.error(error);
          });
      } catch (error) {
        console.error('List files initialization error:', error);
        observer.error(error);
      }
    });
  }

  /**
   * Get upload completion observable
   */
  getUploadComplete(): Observable<boolean> {
    return this.uploadComplete$.asObservable();
  }
}
