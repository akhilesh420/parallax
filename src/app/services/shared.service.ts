import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private progress: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() { }

  // Progress bar
  startProgress(): void {
    this.progress.next(true);
  }

  endProgress(): void {
    this.progress.next(false);
  }

  getProgress(): BehaviorSubject<boolean> {
    return this.progress;
  }
}
