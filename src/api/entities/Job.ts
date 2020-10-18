import { Entity, ObjectIdColumn, Column, ObjectID, Index } from 'typeorm';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { User } from './User';
import { Company } from './Company';
import { BoardColumn } from './BoardColumn';
import { Board } from './Board';

@Entity()
@Index(['board', 'boardColumn', 'index'], { unique: true })
@Index(['board', 'boardColumn', 'sortOrder'], { unique: true })
export class Job {
  @ObjectIdColumn()
  id?: ObjectID;

  @Column()
  @IsNotEmpty()
  company?: ObjectID | Company;

  @Column()
  @IsNotEmpty()
  board?: ObjectID | Board;

  @Column()
  @IsNotEmpty()
  boardColumn?: ObjectID | BoardColumn;

  @Column()
  @IsString()
  title?: string;

  @Column()
  @IsString()
  description?: string;

  @Column()
  @IsString()
  postUrl?: string;

  @Column()
  @IsString()
  location?: string;

  @Column()
  @IsNumber()
  index?: number;

  @Column()
  @IsNumber()
  sortOrder?: number;

  @Column()
  @IsString()
  dateApplied?: string;

  @Column()
  @IsNotEmpty()
  owner?: ObjectID | User;

  @Column()
  @IsString()
  createdAt?: string = new Date().toISOString();

  @Column()
  @IsString()
  updatedAt?: string = new Date().toISOString();

  public constructor(data?: Job) {
    if (data) {
      this.company = data.company;
      this.board = data.board;
      this.boardColumn = data.boardColumn;
      this.title = data.title;
      this.description = data.description;
      this.postUrl = data.postUrl;
      this.location = data.location;
      this.index = data.index;
      this.sortOrder = data.sortOrder;
      this.dateApplied = data.dateApplied;
      this.owner = data.owner;
      this.updatedAt = new Date().toISOString();
    }
  }
}
