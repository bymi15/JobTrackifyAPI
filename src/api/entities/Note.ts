import { Entity, ObjectIdColumn, Column, ObjectID } from 'typeorm';
import { ObjectID as mongoObjectId } from 'mongodb';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity()
export class Note {
  @ObjectIdColumn()
  id?: ObjectID;

  @Column()
  @IsString()
  body?: string;

  @Column()
  @IsNotEmpty()
  // https://github.com/typeorm/typeorm/issues/2238
  // Uses ObjectID from 'mongodb' which is equivalent to typeorm ObjectID (which only includes declarations without real implementations)
  ownerId?: mongoObjectId;

  @Column()
  @IsNotEmpty()
  jobId?: mongoObjectId;

  @Column()
  @IsNotEmpty()
  boardId?: mongoObjectId;

  @Column()
  @IsString()
  createdAt?: string = new Date().toISOString();

  @Column()
  @IsString()
  updatedAt?: string = new Date().toISOString();

  public constructor(data?: Note) {
    if (data) {
      this.body = data.body;
      this.ownerId = data.ownerId;
      this.jobId = data.jobId;
      this.boardId = data.boardId;
    }
  }
}
