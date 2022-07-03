import { takeUntil, Subject } from 'rxjs';
import { FirebaseService } from './../services/firebase.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { User } from '../models/firestore.model';

@Component({
  selector: 'app-user-tab',
  templateUrl: './user-tab.component.html',
  styleUrls: ['./user-tab.component.css']
})
export class UserTabComponent implements OnInit, OnDestroy {

  @Input() uid: string | null = null;
  @Input() host: string | undefined = undefined;
  $notifier: Subject<null> = new Subject();
  username: string = '';

  constructor(private firebaseService: FirebaseService) { }

  ngOnInit(): void {
    if (!this.uid) return;
    this.firebaseService.getUserInformation(this.uid)
    .pipe(takeUntil(this.$notifier))
    .subscribe((user: User | undefined) => {
      if (user) this.username = user.username;
    });
  }

  ngOnDestroy(): void {
    this.$notifier.next(null);
    this.$notifier.complete();
  }

}
