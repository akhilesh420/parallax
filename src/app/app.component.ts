import { SharedService } from './services/shared.service';
import { FirebaseService } from './services/firebase.service';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'parallax';
  version = '1.0.0';

  progress: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private firebaseService: FirebaseService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    // Sign in to firebase
    this.firebaseService.signIn();

    // Toggle progress bar
    this.progress = this.sharedService.getProgress();
  }
}
