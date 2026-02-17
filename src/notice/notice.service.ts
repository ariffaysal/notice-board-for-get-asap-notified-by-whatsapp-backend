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

async saveFromWhatsApp(data: { title: string; content: string }): Promise<Notice> {
  return await this.noticeRepo.save({
    title: data.title,
    content: data.content,
    category: 'WhatsApp', 
  });
}
  async create(createNoticeDto: CreateNoticeDto): Promise<Notice> {
    const savedNotice = await this.noticeRepo.save(createNoticeDto);

    const message = ` *NEW NOTICE ALERT*\n\n*Title:* ${savedNotice.title}\n*Content:* ${savedNotice.content}`;
    const targetGroups = ['.Net Framework Project'];

    targetGroups.forEach(groupName => {
      this.whatsappService.sendMessageToGroup(groupName, message)
        .then(() => console.log(`✅ Notice broadcasted to ${groupName}`))
        .catch(error => console.error(`❌ WhatsApp failed for ${groupName}:`, error));
    });

    return savedNotice;
  }


async findAll() {
  const data = await this.noticeRepo.find({ order: { id: 'DESC' } });
  return data.map(notice => ({
    id: notice.id,
    name: notice.title,      
    message: notice.content, 
    category: notice.category,
    createdAt: notice.createdAt
  }));
}

  async findOne(id: number): Promise<Notice> {
    const notice = await this.noticeRepo.findOneBy({ id });
    if (!notice) throw new NotFoundException(`Notice #${id} not found`);
    return notice;
  }

  async update(id: number, updateData: Partial<CreateNoticeDto>): Promise<Notice> {
    const notice = await this.findOne(id);
    Object.assign(notice, updateData);
    return await this.noticeRepo.save(notice);
  }

  async remove(id: number): Promise<void> {
    const result = await this.noticeRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Notice #${id} not found`);
  }

  async deleteAll() {
    return await this.noticeRepo.clear();
  }
}