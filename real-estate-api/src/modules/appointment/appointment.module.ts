import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { MailModule } from '../../common/mail/mail.module';

@Module({
    imports: [MailModule],
    controllers: [AppointmentController],
    providers: [AppointmentService],
    exports: [AppointmentService],
})
export class AppointmentModule { }
