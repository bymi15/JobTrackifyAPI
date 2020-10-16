import { Entity, ObjectIdColumn, Column, ObjectID } from 'typeorm';
import { IsString } from 'class-validator';

@Entity()
export class BoardColumn {
  @ObjectIdColumn()
  id?: ObjectID;

  @Column()
  @IsString()
  title?: string;

  public constructor(data?: BoardColumn) {
    if (data) {
      this.title = data.title;
    }
  }
}
