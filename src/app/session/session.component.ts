import { Participant } from './../models/firestore.model';
import { FirebaseService } from './../services/firebase.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject, takeUntil, Observable } from 'rxjs';
import { Session, User } from '../models/firestore.model';
import { resolve } from '@angular-devkit/core';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit, OnDestroy {

  username: string = '';
  sid: string | null = null;
  $notifier: Subject<null> = new Subject();
  host: string | undefined = undefined; //Host uid
  isHost: boolean = false;
  unum: number = 0;
  participants: Participant[] = [];
  buttonText: string = 'Join';
  isJoined: boolean = false;
  error: string | null = null;

  constructor(private firebaseService: FirebaseService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.firebaseService.isSignedIn()
      .pipe(takeUntil(this.$notifier))
      .subscribe((uid) => {
        if (!uid) return;
        this.setUpUser(uid);
        this.route.paramMap.subscribe(paramMap => {
          this.sid = paramMap.get('sid');
          this.setUpSession(uid);
        })
      })

  }

  setUpUser(uid: string) {
    this.firebaseService.getUserInformation(uid)
      .pipe(takeUntil(this.$notifier))
      .subscribe((user: User | undefined) => {
        if (user) this.username = user.username;
      });
  }

  setUpSession(uid: string) {
    if (!this.sid) return;
    this.firebaseService.getSession(this.sid)
      .pipe(takeUntil(this.$notifier))
      .subscribe(session => {
        this.host = session?.host_uid;
        this.isHost = this.host === uid;
        if (this.isHost && this.username && this.username.length > 0) {
          this.joinSession().then(() => {
            this.buttonText = 'Start';
            console.log('successfully joined!')
          });
        }
      });
    this.firebaseService.getParticipants(this.sid)
      .pipe(takeUntil(this.$notifier))
      .subscribe(participants => {
        this.participants = participants;
        if (!this.isHost && participants.filter((participant) => participant.uid == uid).length > 0) this.buttonText = "Waiting...";
      });
  }

  onClick() {
    if (this.isJoined && this.isHost) return this.router.navigate([`submit/${this.sid}`])
    if (!this.isJoined) {
      if (!this.username || this.username.length == 0) return this.error = 'Username is required';
      this.joinSession().then(() => console.log('successfully joined!'));
    }
    return;
  }

  joinSession() {
    return new Promise((resolve, reject) => {
      if (!this.sid) return;
      console.log('joining session!')
      resolve(
        this.firebaseService.addUserToSession(this.sid)
          ?.then((response) => {
            this.unum = response.unum;
            this.isJoined = true;
            if (!this.isHost) this.buttonText = "Waiting...";
          })
      )
    })
  }

  updateUsername() {
    this.error = (!this.username || this.username.length == 0) ? 'Username is required' : null;
    if (!this.error) this.firebaseService.updateUsername(this.username);
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') this.updateUsername();
  }

  ngOnDestroy(): void {
    this.$notifier.next(null);
    this.$notifier.complete();
  }
}
