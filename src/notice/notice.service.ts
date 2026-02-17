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


async saveFromWhatsApp(dto: CreateNoticeDto) { 
  const notice = this.noticeRepo.create(dto);
  notice.category = 'WhatsApp';
  return await this.noticeRepo.save(notice);
}


async create(createNoticeDto: CreateNoticeDto): Promise<Notice> {
  const savedNotice = await this.noticeRepo.save(createNoticeDto);

  const message = `*NEW NOTICE ALERT*\n\n*Title:* ${savedNotice.title}\n*Content:* ${savedNotice.content}`;
  
  if (savedNotice.groupName) {
    this.whatsappService.sendMessageToGroup(savedNotice.groupName, message)
      .then(() => console.log(`✅ Notice broadcasted to ${savedNotice.groupName}`))
      .catch(e => console.error(e));
  }

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