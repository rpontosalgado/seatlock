import { IsString, IsArray, ArrayMinSize } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  session_id!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  seat_ids!: string[];

  @IsString()
  user_id!: string;

  @IsString()
  idempotency_key!: string;
}