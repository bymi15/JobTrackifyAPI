import { Entity, ObjectIdColumn, Column, Index, ObjectID } from 'typeorm';
import { IsUrl, IsString, IsNumber, IsOptional } from 'class-validator';

@Entity()
export class Company {
  @ObjectIdColumn()
  id?: ObjectID;

  @Column()
  @IsString()
  @Index({ unique: true })
  name?: string;

  @Column()
  @IsOptional()
  description?: string;

  @Column()
  @IsOptional()
  @IsUrl()
  logo?: string;

  @Column()
  @IsOptional()
  @IsUrl()
  website?: string;

  @Column()
  @IsOptional()
  @IsUrl()
  linkedInUrl?: string;

  @Column()
  @IsOptional()
  @IsString()
  sizeRange?: string;

  @Column()
  @IsOptional()
  @IsNumber()
  currentEmployeeEstimate?: number;

  @Column()
  @IsOptional()
  @IsNumber()
  totalEmployeeEstimate?: number;

  @Column()
  @IsOptional()
  location?: {
    locality?: string;
    country?: string;
  };

  @Column()
  @IsOptional()
  @IsString()
  industry?: string;

  @Column()
  @IsOptional()
  @IsNumber()
  foundedYear?: number;

  @Column()
  createdAt?: string = new Date().toISOString();

  public constructor(data?: Company) {
    if (data) {
      this.name = data.name;
      this.description = data.description;
      this.logo = data.logo;
      this.website = data.website;
      this.linkedInUrl = data.linkedInUrl;
      this.location = data.location;
      this.sizeRange = data.sizeRange;
      this.totalEmployeeEstimate = data.totalEmployeeEstimate;
      this.currentEmployeeEstimate = data.currentEmployeeEstimate;
      this.industry = data.industry;
      this.foundedYear = data.foundedYear;
    }
  }
}
