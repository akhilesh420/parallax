import { Participant } from './../models/firestore.model';
import { FirebaseService } from './../services/firebase.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subject, takeUntil, Observable } from 'rxjs';
import { Session, User } from '../models/firestore.model';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit, OnDestroy {

  username: string = '';
  sid: string | null = null;
  $notifier: Subject<null> = new Subject();
  currentSession: Session | undefined;
  isHost: boolean = false;
  unum: number = 0;
  participants: Participant[] = [];

  constructor(private firebaseService: FirebaseService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.setUpUser();
    this.route.paramMap.subscribe(paramMap => {
      this.sid = paramMap.get('sid');
      this.setUpSession();
    })
  }

  setUpUser() {
    this.firebaseService.isSignedIn()
      .pipe(takeUntil(this.$notifier))
      .subscribe((uid) => {
        if (!uid) return;
        const information = this.firebaseService.getUserInformation(uid);
        if (!information) return
        information
          .pipe(takeUntil(this.$notifier))
          .subscribe((user: User | undefined) => {
            if (user) this.username = user.username;
          });
      })
  }

  setUpSession() {
    if (!this.sid) return;
    this.firebaseService.addUserToSession(this.sid)
      ?.then((response) => {
        this.isHost = response.isHost;
        this.unum = response.unum;
        this.currentSession = response.session;
      });

    this.firebaseService.getParticipants(this.sid)
      .pipe(takeUntil(this.$notifier))
      .subscribe(participants =>  this.participants = participants);
  }

  updateUsername() {
    this.firebaseService.updateUsername(this.username);
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') this.updateUsername();
  }

  ngOnDestroy(): void {
    this.$notifier.next(null);
    this.$notifier.complete();
  }
}
