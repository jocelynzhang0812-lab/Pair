import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, ValidateNested } from 'class-validator';

export class ObjectiveInputDto {
  @IsIn(['startup', 'mentor', 'cross_industry', 'cofound'])
  kind!: 'startup' | 'mentor' | 'cross_industry' | 'cofound';

  @IsIn(['a', 'b'])
  side!: 'a' | 'b';
}

export class ReplaceObjectivesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => ObjectiveInputDto)
  objectives!: ObjectiveInputDto[];
}
