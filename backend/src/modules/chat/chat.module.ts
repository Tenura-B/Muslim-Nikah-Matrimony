import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { RuleEngineModule } from '../rule-engine/rule-engine.module';

@Module({
  imports: [RuleEngineModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
