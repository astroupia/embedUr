import { AuthService } from '../services/auth.service';
import { VerifyEmailDto } from '../dtos/verify-email.dto';
export declare class VerificationController {
    private authService;
    constructor(authService: AuthService);
    verifyEmail(query: VerifyEmailDto): Promise<{
        message: string;
    }>;
}
