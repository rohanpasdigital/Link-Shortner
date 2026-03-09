import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateLinksDto {
  @IsUrl({
    require_protocol: true,
    require_tld: false
  }, { message: 'Please provide a valid URL' })
  url!: string;

  @IsString()
  originalLinkId!: string;

  @IsOptional()
  @IsString()
  moduleName!: string
}