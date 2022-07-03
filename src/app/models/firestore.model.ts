export class Session {
    constructor(
        public host_uid: string,
        public timestamp: Date,
        public participants: number
    ){}
}

export class User {
    constructor(
        public uid: string,
        public username: string,
    ){}
}

export class Participant {
    constructor(
        public uid: string,
        public sid: string,
        public userNumber: number,
        public sessionStartTimestamp: Date,
    ){}
}