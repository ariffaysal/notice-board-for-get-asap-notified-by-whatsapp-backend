import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from './entities/notice.entity';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { WhatsappService } from '../whatsapp.service'; // Added this

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepo: Repository<Notice>,
    private readonly whatsappService: WhatsappService, // Injected the WhatsApp service
  ) {}

async create(createNoticeDto: CreateNoticeDto): Promise<Notice> {
  const savedNotice = await this.noticeRepo.save(createNoticeDto);

  const message = `🧪 *NEW NOTICE ALERT*\n\n*Title:* ${savedNotice.title}\n*Content:* ${savedNotice.content}`;

  // 1. Define your list of groups here
  const targetGroups = ['Chemistry', '.Net Framework Project',];

  // 2. Loop through the groups and send the message to each
  // We use map + Promise.all so they send in parallel (faster)
  try {
    await Promise.all(
      targetGroups.map(groupName => 
        this.whatsappService.sendMessageToGroup(groupName, message)
      )
    );
    console.log(`✅ Notice broadcasted to ${targetGroups.length} groups.`);
  } catch (error) {
    console.error('❌ One or more WhatsApp messages failed:', error);
  }

  return savedNotice;
}
  

  async findAll(): Promise<Notice[]> {
    return await this.noticeRepo.find({ order: { createdAt: 'DESC' } });
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
}