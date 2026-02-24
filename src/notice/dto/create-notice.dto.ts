import { IsString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

export class CreateNoticeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  groupName: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  approvedGroups?: string[];

  @IsString() 
  @IsOptional() 
  whatsappId?: string; 
}