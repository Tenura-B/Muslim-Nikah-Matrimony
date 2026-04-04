import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { SendMessageDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly service: ChatService,
    private readonly gateway: ChatGateway,
  ) {}

  @Post('send')
  send(@CurrentUser() user: any, @Body() dto: SendMessageDto) {
    return this.service.send(user.userId, dto);
  }

  @Get('history/:myProfileId/:otherProfileId')
  history(@Param('myProfileId') myId: string, @Param('otherProfileId') otherId: string) {
    return this.service.getHistory(myId, otherId);
  }

  @Get('conversations/:profileId')
  conversations(@Param('profileId') profileId: string) {
    return this.service.getConversations(profileId);
  }

  /** Returns { [senderProfileId]: unreadCount } for badge display */
  @Get('unread/:profileId')
  unreadCounts(@Param('profileId') profileId: string) {
    return this.service.getUnreadCounts(profileId);
  }

  /** REST fallback for marking messages as read + emitting real-time blue tick */
  @Post('mark-read')
  async markRead(
    @Body() body: { myProfileId: string; otherProfileId: string },
  ) {
    const readIds = await this.service.markRead(body.myProfileId, body.otherProfileId);
    if (readIds.length > 0) {
      // Push messages_read event to the SENDER's socket room so their ticks go blue
      this.gateway.emitMessagesRead(body.otherProfileId, body.myProfileId, readIds);
    }
    return { success: true, readCount: readIds.length };
  }
}
