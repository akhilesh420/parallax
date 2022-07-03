import { Participant } from './../models/firestore.model';
import { FirebaseService } from './../services/firebase.service';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  @Input() participants: Participant[] = [];
  @Input() host: string | undefined = undefined;

  constructor(private firebaseService: FirebaseService) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
  }

}
