import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('notices') // Groups these in Swagger UI
@Controller('notices')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new notice and broadcast to WhatsApp' })
  create(@Body() createNoticeDto: CreateNoticeDto) {
    return this.noticeService.create(createNoticeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notices (formatted for customer)' })
  @ApiResponse({ status: 200, description: 'Returns id, name, message, etc.' })
  findAll() {
    return this.noticeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single notice by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.noticeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateData: Partial<CreateNoticeDto>) {
    return this.noticeService.update(id, updateData);
  }

  @Delete('clear-all')
  @ApiOperation({ summary: 'Wipe the entire database' })
  async removeAll() {
    await this.noticeService.deleteAll();
    return { message: "All notices deleted successfully" };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific notice' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.noticeService.remove(id); 
  }
}