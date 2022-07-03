import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-tab',
  templateUrl: './user-tab.component.html',
  styleUrls: ['./user-tab.component.css']
})
export class UserTabComponent implements OnInit {

  @Input() uid: string | null= null;

  constructor() { }

  ngOnInit(): void {
    console.log(this.uid);
  }

}
