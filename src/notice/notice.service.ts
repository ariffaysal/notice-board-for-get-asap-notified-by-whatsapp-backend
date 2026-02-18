import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from './entities/notice.entity';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { WhatsappService } from '../whatsapp.service'; 

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepo: Repository<Notice>, 
    
    @Inject(forwardRef(() => WhatsappService))
    private readonly whatsappService: WhatsappService, 
  ) {}

  async saveFromWhatsApp(dto: { title: string; content: string; groupName: string }) {
    const notice = this.noticeRepo.create({
      name: dto.title,       
      message: dto.content,  
      groupName: dto.groupName, 
      category: 'WhatsApp',
    });
    return await this.noticeRepo.save(notice);
  }

  async create(createNoticeDto: CreateNoticeDto): Promise<Notice> {
    const noticeInstance = this.noticeRepo.create({
      name: createNoticeDto.title,
      message: createNoticeDto.content,
      groupName: createNoticeDto.groupName,
      category: createNoticeDto.category || 'General'
    });

    const savedNotice = await this.noticeRepo.save(noticeInstance);
    const message = `*NEW NOTICE ALERT*\n\n*Title:* ${savedNotice.name}\n*Content:* ${savedNotice.message}`;
    
    const allTargetGroups = ['.Net Framework Project', 'Chemistry'];

    if (savedNotice.groupName === 'All Groups') {
      allTargetGroups.forEach(group => {
        this.whatsappService.sendMessageToGroup(group, message)
          .then(() => console.log(`✅ Broadcasted to: ${group}`))
          .catch(e => console.error(`❌ Failed for ${group}:`, e.message));
      });
    } else if (savedNotice.groupName) {
      this.whatsappService.sendMessageToGroup(savedNotice.groupName, message)
        .catch(e => console.error('WhatsApp Error:', e.message));
    }

    return savedNotice;
  }

  async findAll() {
    return await this.noticeRepo.find({ order: { id: 'DESC' } });
  }

 
  async deleteByGroupName(groupName: string) {
    return await this.noticeRepo.delete({ groupName });
  }

  async remove(id: number): Promise<void> {
    const result = await this.noticeRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Notice #${id} not found`);
  }

  async deleteAll() {
    return await this.noticeRepo.clear();
  }
}