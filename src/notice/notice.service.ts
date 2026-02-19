import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from './entities/notice.entity';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { WhatsappService } from '../whatsapp.service'; 
import { Setting } from './entities/setting.entity';


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
    const { title, content, groupName, category, approvedGroups } = createNoticeDto;

    const noticeInstance = this.noticeRepo.create({
      name: title,
      message: content,
      groupName: groupName,
      category: category || 'General'
    });

    const savedNotice = await this.noticeRepo.save(noticeInstance);
    const whatsappMessage = `*NEW NOTICE ALERT*\n\n*Title:* ${savedNotice.name}\n*Content:* ${savedNotice.message}`;

    // Logic for broadcasting to moderated "All Groups"
    if (groupName === 'All Groups' && approvedGroups && approvedGroups.length > 0) {
      // ONLY send to groups the user has clicked "Approve" on in the UI
      approvedGroups.forEach(targetGroup => {
        this.whatsappService.sendMessageToGroup(targetGroup, whatsappMessage)
          .then(() => console.log(`✅ Broadcasted to Approved Group: ${targetGroup}`))
          .catch(e => console.error(`❌ Failed for ${targetGroup}:`, e.message));
      });
    } 
    // Logic for a single specific group
    else if (groupName && groupName !== 'All Groups') {
      this.whatsappService.sendMessageToGroup(groupName, whatsappMessage)
        .catch(e => console.error('WhatsApp Error:', e.message));
    }

    return savedNotice;
  }





async updateApprovedGroups(groups: string[]) {
  let setting = await this.noticeRepo.manager.findOne(Setting, { where: { key: 'approved_groups' } });
  
  if (!setting) {
    setting = this.noticeRepo.manager.create(Setting, { key: 'approved_groups', value: groups });
  } else {
    setting.value = groups;
  }
  
  return await this.noticeRepo.manager.save(setting);
}

async getApprovedGroups() {
  const setting = await this.noticeRepo.manager.findOne(Setting, { where: { key: 'approved_groups' } });
  return setting ? setting.value : [];
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