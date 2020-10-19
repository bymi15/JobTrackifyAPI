import { Entity, ObjectIdColumn, Column, Index, ObjectID } from 'typeorm';
import { IsUrl, IsString, IsNumberString, IsOptional } from 'class-validator';

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
  headquarters?: {
    city?: string;
    country?: string;
  };

  @Column()
  @IsOptional()
  @IsString()
  industry?: string;

  @Column()
  @IsNumberString()
  foundedYear?: string;

  @Column()
  createdAt?: string = new Date().toISOString();

  public constructor(data?: Company) {
    if (data) {
      this.name = data.name;
      this.description = data.description;
      this.logo = data.logo;
      this.website = data.website;
      this.headquarters = data.headquarters;
      this.industry = data.industry;
      this.foundedYear = data.foundedYear;
    }
  }
}
