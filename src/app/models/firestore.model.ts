export class Session {
    constructor(
        public host_uid: string,
        public timestamp: Date,
        public participants: number
    ){}
}