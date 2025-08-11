import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Farmer } from "./farmer.entity";
import { Harvest } from "./harvest.entity";

@Entity('farms')
export class Farm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalArea: number;

  @Column('decimal', { precision: 10, scale: 2 })
  cultivationArea: number;

  @Column('decimal', { precision: 10, scale: 2 })
  vegetationArea: number;

  @Column({ name: 'farmerId' })
  farmerId: string;

  @ManyToOne(() => Farmer, (farmer) => farmer.farm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmerId' })
  farmer: Farmer;

  @OneToMany(() => Harvest, (harvest) => harvest.farm)
  harvests: Harvest[];
}