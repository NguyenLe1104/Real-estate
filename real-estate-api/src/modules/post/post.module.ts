import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';
import { MailModule } from '../../common/mail/mail.module';
import { AiModule } from '../ai/ai.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [CloudinaryModule, MailModule, AiModule, NotificationModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
