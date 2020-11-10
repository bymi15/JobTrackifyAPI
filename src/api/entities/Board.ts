import { Entity, ObjectIdColumn, Column, ObjectID } from 'typeorm';
import { IsString, IsNotEmpty } from 'class-validator';
import { User } from './User';

@Entity()
export class Board {
  @ObjectIdColumn()
  id?: ObjectID;

  @Column()
  @IsString()
  title?: string;

  @Column()
  @IsNotEmpty()
  owner?: ObjectID | User;

  @Column()
  @IsString()
  createdAt?: string = new Date().toISOString();

  @Column()
  @IsString()
  updatedAt?: string = new Date().toISOString();

  public constructor(data?: Board) {
    if (data) {
      this.title = data.title;
      this.owner = data.owner;
    }
  }
}
