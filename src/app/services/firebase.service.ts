import { SharedService } from './shared.service';
import { Participant, Session, User } from './../models/firestore.model';
import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, map, Observable, take } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private uid: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private username: string | undefined;

  constructor(
    private sharedService: SharedService,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) { }


  // --------------------------------------- Authentication ---------------------------------------

  signIn() {
    // Update uid on auth change
    this.auth.onAuthStateChanged(user => {
      this.uid.next(!user ? null : user.uid);
    });

    // Sign in anonymously
    this.auth.signInAnonymously()
      .then(user => user.additionalUserInfo?.isNewUser ? this.userBootstrap() : this.storeUsername())
      .catch(error => this.handleError(error));
  }

  isSignedIn() {
    return this.uid;
  }

  getUserUid(): string | null {
    return this.uid.value
  }

  // --------------------------------------- Firestore ---------------------------------------


  async createSession(): Promise<string | void> {
    const sid = this.firestore.createId();
    const uid = this.getUserUid();
    if (uid) {
      const session: Session = new Session(uid, new Date(), 0);
      this.sharedService.startProgress();
      try {
        await this.firestore.collection('sessions').doc(sid).set({ ...session });
        return sid;
      } catch (error) {
        return this.handleError(error);
      } finally {
        this.sharedService.endProgress();
      }
    }
    throw ('User not logged in');
  }

  getSession(sid: string): Observable<Session | undefined> {
    return this.firestore.collection('sessions').doc<Session>(sid).valueChanges()
  }

  getParticipants(sid: string): Observable<Participant[]> {
    return this.firestore.collection('sessions').doc(sid)
      .collection<Participant>('participants', ref => ref.orderBy("sessionStartTimestamp")).valueChanges()
  }


  addUserToSession(sid: string): Promise<any> | undefined {
    const uid = this.getUserUid();
    if (uid) {

      const sessionDocRef = this.firestore.firestore.collection('sessions').doc(sid);
      const userDocRef = sessionDocRef.collection('participants').doc(uid);

      const transaction = this.firestore.firestore.runTransaction(async (transaction) => {
        let unum = 0;

        return Promise.all([transaction.get(sessionDocRef), transaction.get(userDocRef)]).then((response) => {
          const [sessionDoc, userDoc] = response;

          if (!sessionDoc.exists) throw "Document does not exist!";

          if (!userDoc.exists) {
            unum = sessionDoc.data()?.['participants'] + 1;
            transaction.update(sessionDocRef, {
              participants: unum,
              processed: false,
            });
            const participant: Participant = new Participant(uid, sid, unum, new Date());
            transaction.set(userDocRef, { ...participant });
          } else {
            unum = userDoc.data()?.['userNumber'];
          }
          return { unum: unum };
        });
      });

      return transaction.catch((e) => {
        if (e.message === 'Connection failed.') throw ("Please check your internet connection and try again."); //Failed internet connection
        if (e.name) throw ("An error occurred while processing your request. Please try again later!"); //Other error and exceptions
        throw (e); //Custom error
      })
    }
    return undefined
  }

  userBootstrap() {
    this.addUser()?.then(() => this.storeUsername());
  }

  addUser() {
    const uid = this.getUserUid();
    if (!uid) return;
    const user: User = new User(uid, '');
    return this.firestore.collection('users').doc(uid).set({ ...user });
  }

  storeUsername() {
    const uid = this.getUserUid();
    if (!uid) return;
    this.getUserInformation(uid)?.subscribe((user) => this.username = user?.username);
  }

  updateUsername(username: string) {
    if (username === this.username) return;
    const uid = this.getUserUid();
    if (!uid) return;
    const user = new User(uid, username);
    this.firestore.collection('users').doc(uid).update({ ...user });
  }

  getUserInformation(uid: string): Observable<User | undefined> {
    return this.firestore.collection('users').doc<User>(uid).valueChanges();
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
