import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private showSidebarSubject = new BehaviorSubject<boolean>(true);
  showSidebar$ = this.showSidebarSubject.asObservable();

  setShowSidebar(value: boolean): void {
    this.showSidebarSubject.next(value);
  }
}
