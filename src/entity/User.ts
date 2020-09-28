import { Entity, ObjectIdColumn, ObjectID, Column, Index } from 'typeorm';
import { IsEmail, IsString } from 'class-validator';

@Entity()
export class User {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  fullName: string;

  @Column()
  @IsEmail(
    {},
    {
      message: 'Invalid email address',
    }
  )
  @Index({ unique: true })
  email: string;

  @Column()
  @IsString()
  password: string;

  @Column()
  role: string;
}
