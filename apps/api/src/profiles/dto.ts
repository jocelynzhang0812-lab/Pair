import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsUUID,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class SocialLinkInputDto {
  @IsIn(['linkedin', 'xiaohongshu', 'website', 'other'])
  platform!: 'linkedin' | 'xiaohongshu' | 'website' | 'other';

  @IsUrl({ require_protocol: true })
  url!: string;
}

export class UpsertProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  headline!: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  avatarUrl?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1200)
  bio!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(12)
  @IsString({ each: true })
  tags!: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => SocialLinkInputDto)
  socialLinks?: SocialLinkInputDto[];
}

export class GenerateProfileDto {
  @IsOptional()
  @IsUrl({ require_protocol: true })
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  pastedText?: string;

  @IsOptional()
  @IsString()
  locale?: string;
}

export class ConfirmProfileDraftDto {
  @IsUUID()
  draftId!: string;
}
