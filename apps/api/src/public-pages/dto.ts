import { IsBoolean, IsOptional, IsUrl } from 'class-validator';

export class UpdatePublicPageDto {
  @IsOptional()
  @IsUrl({ require_protocol: true })
  ogImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
