import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('whitelisted_groups')
export class WhitelistedGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; 

  @Column({ default: true })
  isActive: boolean;
}