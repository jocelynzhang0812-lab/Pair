import { IsIn, IsOptional } from 'class-validator';

export class RewriteIntroDto {
  @IsOptional()
  @IsIn(['professional', 'casual', 'story'])
  variant?: 'professional' | 'casual' | 'story';
}
