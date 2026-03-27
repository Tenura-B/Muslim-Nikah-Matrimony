import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  childProfileId: string;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional() @IsString()
  bankRef?: string;

  @IsOptional() @IsString()
  bankSlipUrl?: string;
}

export class VerifyPaymentDto {
  @IsString()
  paymentId: string;

  @IsString()
  gatewayRef: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async initiate(userId: string, dto: InitiatePaymentDto) {
    const profile = await this.prisma.childProfile.findUnique({
      where: { id: dto.childProfileId },
    });
    if (!profile || profile.userId !== userId) {
      throw new BadRequestException({ success: false, message: 'Profile not found or not owned', error_code: 'FORBIDDEN' });
    }

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        childProfileId: dto.childProfileId,
        amount: dto.amount,
        method: dto.method,
        status: dto.method === 'BANK_TRANSFER' ? 'PENDING' : 'PENDING',
        bankRef: dto.bankRef,
        bankSlipUrl: dto.bankSlipUrl,
      },
    });

    // Move profile to PAYMENT_PENDING
    await this.prisma.childProfile.update({
      where: { id: dto.childProfileId },
      data: { status: 'PAYMENT_PENDING' },
    });

    if (dto.method === 'BANK_TRANSFER') {
      this.events.emit('PAYMENT_PENDING', { paymentId: payment.id, profileId: profile.id });
      this.logger.log(`BANK_TRANSFER payment initiated: ${payment.id}`);
    }

    return { success: true, data: payment };
  }

  async verifyGateway(userId: string, dto: VerifyPaymentDto) {
    const payment = await this.prisma.payment.findUnique({ where: { id: dto.paymentId } });
    if (!payment || payment.userId !== userId) {
      throw new BadRequestException({ success: false, message: 'Payment not found', error_code: 'NOT_FOUND' });
    }

    // Use transaction: mark payment SUCCESS + activate subscription
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCESS', gatewayRef: dto.gatewayRef },
      });

      await this.activateSubscription(tx, payment.childProfileId);
    });

    this.events.emit('PAYMENT_SUCCESS', { paymentId: payment.id, profileId: payment.childProfileId });
    this.logger.log(`Gateway payment VERIFIED: ${payment.id}`);

    return { success: true, message: 'Payment verified and profile activated' };
  }

  async activateSubscription(tx: any, childProfileId: string) {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 30);

    // Upsert subscription
    await tx.subscription.upsert({
      where: { childProfileId },
      update: { status: 'ACTIVE', startDate: now, endDate: end },
      create: {
        childProfileId,
        status: 'ACTIVE',
        startDate: now,
        endDate: end,
      },
    });

    // Activate profile
    await tx.childProfile.update({
      where: { id: childProfileId },
      data: { status: 'ACTIVE' },
    });

    this.events.emit('PROFILE_ACTIVATED', { profileId: childProfileId });
    this.logger.log(`Profile ACTIVATED: ${childProfileId}`);
  }

  async getMyPayments(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: payments };
  }
}
