import { FirebaseService } from './../services/firebase.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  createSession() {
    const user_uid = this.firebaseService.getUserUid();
    if (user_uid) {
      this.firebaseService.createSession()
        .then(sid => this.router.navigate([`session/${sid}`]))
        .catch(error => console.log(error));
    }
  }

}
