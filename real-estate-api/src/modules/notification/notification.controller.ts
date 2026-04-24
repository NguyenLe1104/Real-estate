import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // GET /notifications?page=1&limit=20
  @Get()
  findAll(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const userId = req.user.id;
    return this.notificationService.findByUser(
      userId,
      parseInt(page),
      parseInt(limit),
    );
  }

  // GET /notifications/unread-count
  @Get('unread-count')
  countUnread(@Req() req: any) {
    return this.notificationService.countUnread(req.user.id);
  }

  // PATCH /notifications/mark-all-read
  @Patch('mark-all-read')
  markAllAsRead(@Req() req: any) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  // DELETE /notifications/read
  @Delete('read')
  deleteAllRead(@Req() req: any) {
    return this.notificationService.deleteAllRead(req.user.id);
  }

  // PATCH /notifications/:id/read
  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.notificationService.markAsRead(id, req.user.id);
  }

  // DELETE /notifications/:id
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.notificationService.delete(id, req.user.id);
  }
}
