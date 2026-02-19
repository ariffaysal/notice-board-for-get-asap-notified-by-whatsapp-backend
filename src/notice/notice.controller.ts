import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('notices') 
@Controller('notices')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notice and broadcast to WhatsApp' })
  create(@Body() createNoticeDto: CreateNoticeDto) {
    return this.noticeService.create(createNoticeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notices' })
  findAll() {
    return this.noticeService.findAll();
  }

  @Delete('clear-all')
  @ApiOperation({ summary: 'Wipe the entire database' })
  async removeAll() {
    await this.noticeService.deleteAll();
    return { message: "All notices deleted successfully" };
  }

  @Delete('group/:groupName')
  @ApiOperation({ summary: 'Delete all notices from a specific group' })
  async deleteByGroup(@Param('groupName') groupName: string) {
    return this.noticeService.deleteByGroupName(groupName);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific notice' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.noticeService.remove(id); 
  }





@Get('settings/groups')
@ApiOperation({ summary: 'GET: Fetch the list of approved groups from database' })
async getApprovedGroups() {
  return await this.noticeService.getApprovedGroups();
}

@Post('settings/groups')
@ApiOperation({ summary: 'SEND: Update/Save the approved groups list to database' })
async updateApprovedGroups(@Body() body: { groups: string[] }) {
  return await this.noticeService.updateApprovedGroups(body.groups);
}
}