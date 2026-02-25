import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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

  /**
   * Captures messages coming FROM WhatsApp into the DB.
   * Logic: Used by the WhatsApp webhooks/listeners.
   */
  async saveFromWhatsApp(dto: { title: string; content: string; groupName: string; whatsappId: string }) {
    const notice = this.noticeRepo.create({
      name: dto.title,      
      message: dto.content,  
      groupName: dto.groupName, 
      whatsappId: dto.whatsappId,
      category: 'WhatsApp',
    });
    return await this.noticeRepo.save(notice);
  }

  /**
   * Primary method for creating notices via Browser, API, or Terminal.
   * FIXED: Destructuring matches the CreateNoticeDto (name/message).
   */
  async create(createNoticeDto: CreateNoticeDto): Promise<Notice> {
    // 🔑 Destructure using names that match your DTO exactly
    const { name, message, groupName, category, approvedGroups, whatsappId } = createNoticeDto;

    const noticeInstance = this.noticeRepo.create({
      name: name,             // Mapping DTO 'name' to Entity 'name'
      message: message,       // Mapping DTO 'message' to Entity 'message'
      groupName: groupName,
      whatsappId: whatsappId, 
      category: category || 'General'
    });

    // Save to Database
    const savedNotice = await this.noticeRepo.save(noticeInstance);

    // Prepare WhatsApp Message
    const whatsappMessage = `*NEW NOTICE ALERT*\n\n*Title:* ${savedNotice.name}\n*Content:* ${savedNotice.message}`;

    // --- WHATSAPP ROUTING LOGIC ---

    // 1. Priority: Direct Send via WhatsApp ID (Precise for API/Terminal/Replies)
    if (whatsappId) {
      await this.whatsappService.sendMessageToId(whatsappId, whatsappMessage)
        .then(() => console.log(`✅ Sent to JID: ${whatsappId}`))
        .catch(e => console.error(`❌ JID Send Error:`, e.message));
    } 
    // 2. Browser Broadcast: Send to all approved group names
    else if (groupName === 'All Groups' && approvedGroups && approvedGroups.length > 0) {
      approvedGroups.forEach(targetGroupName => {
        this.whatsappService.sendMessageToGroup(targetGroupName, whatsappMessage)
          .then(() => console.log(`✅ Broadcasted to: ${targetGroupName}`))
          .catch(e => console.error(`❌ Broadcast Failed for ${targetGroupName}:`, e.message));
      });
    } 
    // 3. Browser Individual: Send to a single group name
    else if (groupName && groupName !== 'All Groups') {
      this.whatsappService.sendMessageToGroup(groupName, whatsappMessage)
        .then(() => console.log(`✅ Sent to Group Name: ${groupName}`))
        .catch(e => console.error(`❌ Group Name Error (${groupName}):`, e.message));
    }

    return savedNotice;
  }

  // --- SETTINGS MANAGEMENT ---

  async updateApprovedGroups(groups: string[]) {
    // Accessing Setting entity via the manager
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

  // --- QUERY & DELETE METHODS ---

  async findAll() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await this.noticeRepo.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Notice> {
    const notice = await this.noticeRepo.findOne({ where: { id } });
    if (!notice) throw new NotFoundException(`Notice #${id} not found`);
    return notice;
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