import { Injectable, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RuleEngineService } from '../rule-engine/rule-engine.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ruleEngine: RuleEngineService,
    private readonly events: EventEmitter2,
  ) {}

  async send(userId: string, dto: SendMessageDto) {
    // Load both profiles with subscriptions
    const [senderProfile, receiverProfile] = await Promise.all([
      this.prisma.childProfile.findUnique({ where: { id: dto.senderProfileId }, include: { subscription: true } }),
      this.prisma.childProfile.findUnique({ where: { id: dto.receiverProfileId }, include: { subscription: true } }),
    ]);

    if (!senderProfile || !receiverProfile) {
      throw new BadRequestException({ success: false, message: 'Profile not found', error_code: 'NOT_FOUND' });
    }

    // Sender must own the profile
    if (senderProfile.userId !== userId) {
      throw new ForbiddenException({ success: false, message: 'You do not own this profile', error_code: 'FORBIDDEN' });
    }

    // Sender must be ACTIVE
    if (senderProfile.status !== 'ACTIVE') {
      throw new ForbiddenException({ success: false, message: 'Sender profile is not active', error_code: 'PROFILE_INACTIVE' });
    }

    // Chat is allowed IF:
    // 1. canViewProfile passes (gender/age/subscription rules)
    // 2. Chat is ALWAYS enabled if canViewContact == false (fallback system)
    const ctx = { viewer: senderProfile as any, target: receiverProfile as any };
    const profileCheck = this.ruleEngine.canViewProfile(ctx);

    if (!profileCheck.allowed) {
      throw new ForbiddenException({
        success: false,
        message: `Cannot chat: ${profileCheck.reason}`,
        error_code: 'CHAT_NOT_ALLOWED',
      });
    }

    // log whether chat is contact-fallback mode
    const contactCheck = this.ruleEngine.canViewContact(ctx);
    if (!contactCheck.allowed) {
      this.logger.log(`Chat FALLBACK mode (contact hidden): sender=${dto.senderProfileId} → receiver=${dto.receiverProfileId}`);
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        senderId: userId,
        senderProfileId: dto.senderProfileId,
        receiverProfileId: dto.receiverProfileId,
        content: dto.content,
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
    // Get all unique conversations
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
}
