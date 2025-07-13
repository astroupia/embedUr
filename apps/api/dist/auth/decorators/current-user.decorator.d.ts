export interface CurrentUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    companyId: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
