import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('MAIL_HOST'),
            port: Number(this.configService.get('MAIL_PORT')),
            secure: false,
            auth: {
                user: this.configService.get('MAIL_USER'),
                pass: this.configService.get('MAIL_PASSWORD'),
            },
        });
    }

    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        await this.transporter.sendMail({
            from: `"Real Estate" <${this.configService.get('MAIL_USER')}>`,
            to,
            subject,
            html,
        });
    }

    getApprovalEmailHtml(fullName: string, appointmentDate: string): string {
        return `
      <h2>Appointment Approved</h2>
      <p>Dear ${fullName},</p>
      <p>Your appointment on <strong>${appointmentDate}</strong> has been approved.</p>
      <p>Please arrive on time. Thank you!</p>
    `;
    }

    getCancellationEmailHtml(fullName: string, appointmentDate: string): string {
        return `
      <h2>Appointment Cancelled</h2>
      <p>Dear ${fullName},</p>
      <p>Your appointment on <strong>${appointmentDate}</strong> has been cancelled.</p>
      <p>Please contact us for more details.</p>
    `;
    }
}
