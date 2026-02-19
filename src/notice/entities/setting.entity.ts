import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string; 

  @Column('simple-array', { nullable: true })
  value: string[];
}