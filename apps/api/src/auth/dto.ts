import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class MockLoginDto {
  @IsOptional()
  @IsIn(['email', 'wechat', 'google'])
  provider?: 'email' | 'wechat' | 'google';

  @IsString()
  @MinLength(3)
  providerId!: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class WeChatLoginDto {
  @IsString()
  @MinLength(3)
  code!: string;
}
