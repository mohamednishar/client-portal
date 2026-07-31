import { Injectable, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storageSubject = new Subject<{ key: string | null; newValue: string | null }>();

  constructor() {
    this.initStorageEventListener();
  }

  private initStorageEventListener(): void {
    window.addEventListener('storage', (event: StorageEvent) => {
      this.storageSubject.next({
        key: event.key,
        newValue: event.newValue
      });
    });
  }

  public getStorageChanges(): Observable<{ key: string | null; newValue: string | null }> {
    return this.storageSubject.asObservable();
  }

  public getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error(`Error reading key ${key} from localStorage:`, e);
      return null;
    }
  }

  public setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(`Error setting key ${key} in localStorage:`, e);
    }
  }

  public removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing key ${key} from localStorage:`, e);
    }
  }

  public clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
  }
}
