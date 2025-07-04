export declare class MailService {
    constructor();
    sendVerification(email: string, token: string): Promise<void>;
    sendPasswordReset(email: string, token: string): Promise<void>;
}
