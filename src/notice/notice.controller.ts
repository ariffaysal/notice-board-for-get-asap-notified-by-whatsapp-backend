import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common'; // Added UseGuards here
import { NoticeService } from './notice.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { ApiTags, ApiOperation, ApiSecurity} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiKeyGuard } from '../api-key.guard';


@ApiTags('notices') 
@Controller('notices')
@ApiSecurity('x-api-key')
@SkipThrottle()
export class NoticeController {
  
  constructor(private readonly noticeService: NoticeService) {}


  @Post()
  @UseGuards(ApiKeyGuard) 
  @SkipThrottle({ default: false })
  @ApiOperation({ summary: 'Create a new notice and broadcast to WhatsApp' })
  create(@Body() createNoticeDto: CreateNoticeDto) {
    return this.noticeService.create(createNoticeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notices' })
  findAll() {
    return this.noticeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific notice by ID' })
  findOne(@Param('id') id: string) {
    return this.noticeService.findOne(+id); 
  }

  @Delete('clear-all')
  @UseGuards(ApiKeyGuard)
  @SkipThrottle({ default: false })
  @ApiOperation({ summary: 'Wipe the entire database' })
  async removeAll() {
    await this.noticeService.deleteAll();
    return { message: "All notices deleted successfully" };
  }

  @Delete('group/:groupName')
  @UseGuards(ApiKeyGuard)
  @SkipThrottle({ default: false }) 
  @ApiOperation({ summary: 'Delete all notices from a specific group' })
  async deleteByGroup(@Param('groupName') groupName: string) {
    return this.noticeService.deleteByGroupName(groupName);
  }

  @Delete(':id')
  @UseGuards(ApiKeyGuard)
  @SkipThrottle({ default: false }) 
  @ApiOperation({ summary: 'Delete a specific notice' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.noticeService.remove(id); 
  }

  @Get('settings/groups')
  @ApiOperation({ summary: 'GET: Fetch the list of approved groups' })
  async getApprovedGroups() {
    return await this.noticeService.getApprovedGroups();
  }

  @Post('settings/groups')
  @UseGuards(ApiKeyGuard)
  @SkipThrottle({ default: false }) 
  @ApiOperation({ summary: 'SEND: Update/Save the approved groups list' })
  async updateApprovedGroups(@Body() body: { groups: string[] }) {
    return await this.noticeService.updateApprovedGroups(body.groups);
  }
}