import { IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  reservation_id!: string;
}