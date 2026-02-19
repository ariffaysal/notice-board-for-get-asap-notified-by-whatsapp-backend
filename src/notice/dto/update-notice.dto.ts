import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateNoticeDto {
  @IsString()
  @IsOptional()
  title?: string; 

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  groupName?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  approvedGroups?: string[]; 
}