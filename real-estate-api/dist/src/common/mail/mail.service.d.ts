import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendEmail(to: string, subject: string, html: string): Promise<void>;
    getApprovalEmailHtml(fullName: string, appointmentDate: string): string;
    getCancellationEmailHtml(fullName: string, appointmentDate: string): string;
}
