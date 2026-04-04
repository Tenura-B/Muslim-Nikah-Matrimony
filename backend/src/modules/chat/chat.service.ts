import { Injectable, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async send(userId: string, dto: SendMessageDto) {
    const [senderProfile, receiverProfile] = await Promise.all([
      this.prisma.childProfile.findUnique({ where: { id: dto.senderProfileId }, include: { subscription: true } }),
      this.prisma.childProfile.findUnique({ where: { id: dto.receiverProfileId }, include: { subscription: true } }),
    ]);

    if (!senderProfile || !receiverProfile) {
      throw new BadRequestException({ success: false, message: 'Profile not found', error_code: 'NOT_FOUND' });
    }
    if (senderProfile.userId !== userId) {
      throw new ForbiddenException({ success: false, message: 'You do not own this profile', error_code: 'FORBIDDEN' });
    }
    if (senderProfile.status !== 'ACTIVE') {
      throw new ForbiddenException({ success: false, message: 'Sender profile is not active', error_code: 'PROFILE_INACTIVE' });
    }
    if (senderProfile.subscription?.status !== 'ACTIVE') {
      throw new ForbiddenException({ success: false, message: 'You need an active subscription to send messages', error_code: 'NO_SUBSCRIPTION' });
    }
    if (receiverProfile.status !== 'ACTIVE') {
      throw new ForbiddenException({ success: false, message: 'Receiver profile is not active', error_code: 'RECEIVER_INACTIVE' });
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        senderId: userId,
        senderProfileId: dto.senderProfileId,
        receiverProfileId: dto.receiverProfileId,
        content: dto.content,
        imageUrl: dto.imageUrl,
      },
    });

    this.events.emit('MESSAGE_SENT', { messageId: message.id, sender: dto.senderProfileId, receiver: dto.receiverProfileId });
    this.logger.log(`Message SENT: ${message.id}`);

    return { success: true, data: message };
  }

  async getHistory(viewerProfileId: string, otherProfileId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderProfileId: viewerProfileId, receiverProfileId: otherProfileId },
          { senderProfileId: otherProfileId, receiverProfileId: viewerProfileId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: messages };
  }

  async getConversations(profileId: string) {
    const sent = await this.prisma.chatMessage.findMany({
      where: { senderProfileId: profileId },
      select: { receiverProfileId: true, receiverProfile: { select: { id: true, name: true } }, createdAt: true },
      distinct: ['receiverProfileId'],
      orderBy: { createdAt: 'desc' },
    });
    const received = await this.prisma.chatMessage.findMany({
      where: { receiverProfileId: profileId },
      select: { senderProfileId: true, senderProfile: { select: { id: true, name: true } }, createdAt: true },
      distinct: ['senderProfileId'],
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: { sent, received } };
  }

  /** Returns per-sender unread counts for myProfileId (for badge polling) */
  async getUnreadCounts(myProfileId: string): Promise<Record<string, number>> {
    const rows = await this.prisma.chatMessage.groupBy({
      by: ['senderProfileId'],
      where: { receiverProfileId: myProfileId, readAt: null },
      _count: { id: true },
    });
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.senderProfileId] = row._count.id;
    }
    return counts;
  }

  /** Mark all messages FROM otherProfileId TO myProfileId as read */
  async markRead(myProfileId: string, otherProfileId: string): Promise<string[]> {
    const now = new Date();
    const unread = await this.prisma.chatMessage.findMany({
      where: { senderProfileId: otherProfileId, receiverProfileId: myProfileId, readAt: null },
      select: { id: true },
    });
    if (unread.length === 0) return [];
    const ids = unread.map(m => m.id);
    await this.prisma.chatMessage.updateMany({
      where: { id: { in: ids } },
      data: { readAt: now },
    });
    this.logger.log(`Marked ${ids.length} messages as read: ${myProfileId} ← ${otherProfileId}`);
    return ids;
  }
}
