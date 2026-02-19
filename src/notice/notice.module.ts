// import { Module, forwardRef } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { NoticeService } from './notice.service';
// import { NoticeController } from './notice.controller';
// import { Notice } from './entities/notice.entity';
// import { WhatsappService } from '../whatsapp.service'; 

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([Notice]),
//   ],
//   controllers: [NoticeController],
//   providers: [NoticeService, WhatsappService],
//   exports: [NoticeService]
// })
// export class NoticeModule {}





import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeService } from './notice.service';
import { NoticeController } from './notice.controller';
import { Notice } from './entities/notice.entity';
import { Setting } from './entities/setting.entity'; // Make sure this import is here
import { WhatsappService } from '../whatsapp.service'; 

@Module({
  imports: [
  
    TypeOrmModule.forFeature([Notice, Setting]),
  ],
  controllers: [NoticeController],
  providers: [NoticeService, WhatsappService],
  exports: [NoticeService]
})
export class NoticeModule {}
