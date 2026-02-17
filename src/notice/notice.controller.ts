import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { CreateNoticeDto } from './dto/create-notice.dto';



@Controller('notices')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  create(@Body() createNoticeDto: CreateNoticeDto) {
    return this.noticeService.create(createNoticeDto);
  }

  @Get()
  findAll() {
    return this.noticeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.noticeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateData: Partial<CreateNoticeDto>) {
    return this.noticeService.update(id, updateData);
  }

@Delete('clear-all')
async removeAll() {
  await this.noticeService.deleteAll();
  return { message: "All deleted" };
}

@Delete(':id')
async remove(@Param('id') id: string) {
  return this.noticeService.remove(+id); 
}
}