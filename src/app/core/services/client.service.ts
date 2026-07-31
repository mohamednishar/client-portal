import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ClientConfig } from '../models/client.model';
import { User } from '../models/user.model';
import { ThemeService } from './theme.service';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/storage.keys';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private themeService = inject(ThemeService);
  private storageService = inject(StorageService);

  public currentClientSignal = signal<ClientConfig | null>(null);
  public isLoadingSignal = signal<boolean>(false);
  public clientErrorSignal = signal<string | null>(null);

  private currentClientSubject = new BehaviorSubject<ClientConfig | null>(null);
  public currentClient$ = this.currentClientSubject.asObservable();

  public loadClientConfig(clientId: string): Observable<ClientConfig> {
    const activeId = clientId || 'client-a';
    this.isLoadingSignal.set(true);
    this.clientErrorSignal.set(null);

    const jsonPath = `assets/mock/${activeId}.json`;

    return this.http.get<ClientConfig>(jsonPath).pipe(
      tap((config) => {
        this.currentClientSignal.set(config);
        this.currentClientSubject.next(config);
        this.isLoadingSignal.set(false);

        if (config.theme) {
          this.themeService.applyTheme(config.theme);
        }
      }),
      catchError((error) => {
        this.isLoadingSignal.set(false);
        const errorMsg = `Failed to load client config for '${activeId}'`;
        this.clientErrorSignal.set(errorMsg);
        this.currentClientSignal.set(null);
        this.currentClientSubject.next(null);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  public getClientId(): string | null {
    return this.currentClientSignal()?.clientId || null;
  }

  public getClientName(): string {
    return this.currentClientSignal()?.clientName || 'Client Portal';
  }

  public getDepartments(): string[] {
    return this.currentClientSignal()?.departments || [];
  }

  public getUsers(): User[] {
    return this.currentClientSignal()?.users || [];
  }
}
