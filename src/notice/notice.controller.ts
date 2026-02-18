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
    // Fixed: Uses the injected service from the constructor
    return this.noticeService.deleteByGroupName(groupName);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific notice' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.noticeService.remove(id); 
  }
}