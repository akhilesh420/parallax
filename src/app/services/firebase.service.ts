import { Session } from './../models/firestore.model';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private uid: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) { }


  // --------------------------------------- Authentication ---------------------------------------

  signIn() {
    // Update uid on auth change
    this.auth.onAuthStateChanged(user => this.uid.next(!user ? null : user.uid));

    // Sign in anonymously
    this.auth.signInAnonymously().then()
      .catch(error => this.handleError(error));
  }

  getUserUid(): string | null {
    return this.uid.value
  }

  // --------------------------------------- Firestore ---------------------------------------


  createSession(): Promise<string | void> {
    const sid = this.firestore.createId();
    const uid = this.getUserUid();
    if (uid) {
      const session: Session = new Session(uid, new Date(), 0);
      return this.firestore.collection('sessions').doc(sid).set({ ...session })
        .then(() => sid)
        .catch(error => this.handleError(error))
    }
    throw('User not logged in')
  }

  // --------------------------------------- Error handling ---------------------------------------
  handleError(error: any) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage)
    throw (errorMessage)
  }
}
