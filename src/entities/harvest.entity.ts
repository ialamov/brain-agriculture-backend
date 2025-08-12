import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Crop } from "./crop.entity";
import { Farm } from "./farm.entity";

@Entity('harvests')
export class Harvest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  year: number;

  @Column({ name: 'farmId' })
  farmId: string;

  @ManyToOne(() => Farm, (farm) => farm.harvests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmId' })
  farm: Farm;

  @OneToMany(() => Crop, (crop) => crop.harvest, { onDelete: 'CASCADE' })
  crops: Crop[];
}