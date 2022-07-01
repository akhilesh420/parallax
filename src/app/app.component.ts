import { FirebaseService } from './services/firebase.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'parallax';
  version = '1.0.0'

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    // Sign in to firebase
    this.firebaseService.signIn(); 
  }
}
