import { Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';

@Entity()
export class Company {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  name: string;

  @Column()
  logoUrl: string;

  @Column()
  description: string;

  @Column()
  website: string;

  @Column()
  headquarters: string;

  @Column()
  industry: string;

  @Column()
  foundedYear: number;

  @Column({ default: () => `now()` })
  createdAt: string;
}
