import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeService } from './notice.service';
import { NoticeController } from './notice.controller';
import { Notice } from './entities/notice.entity';
import { WhatsappService } from '../whatsapp.service'; // Import this

@Module({
  imports: [TypeOrmModule.forFeature([Notice])],
  controllers: [NoticeController],
  providers: [NoticeService, WhatsappService], // Add WhatsappService here
})
export class NoticeModule {}