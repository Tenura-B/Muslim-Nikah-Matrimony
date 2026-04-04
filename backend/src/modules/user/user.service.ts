import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, message: 'Not found', error_code: 'NOT_FOUND' };
    const { password: _, ...safe } = user;
    return { success: true, data: safe };
  }

  async updateMe(userId: string, data: { phone?: string; whatsappNumber?: string }) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    const { password: _, ...safe } = updated;
    return { success: true, data: safe };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found.');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect.');

    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different from current password.');
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    this.logger.log(`Password changed for user ${userId}`);
    return { success: true, message: 'Password updated successfully.' };
  }
}
