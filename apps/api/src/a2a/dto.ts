import { IsUUID } from 'class-validator';

export class StartA2ADto {
  @IsUUID()
  matchId!: string;
}
