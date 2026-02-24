import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notices')
export class Notice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  
  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'General' })
  category: string;


@Column({ nullable: true })
groupName: string;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  
    @Column({ nullable: true })
    whatsappId: string; 
  
}