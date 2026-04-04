import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  senderProfileId: string;

  @IsString()
  @IsNotEmpty()
  receiverProfileId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
