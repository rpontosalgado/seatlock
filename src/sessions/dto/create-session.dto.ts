import { IsString, IsDateString, IsInt, Min } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  movie_id!: string;

  @IsString()
  room_id!: string;

  @IsDateString()
  start_time!: string;

  @IsInt()
  @Min(1)
  price_cents!: number;
}