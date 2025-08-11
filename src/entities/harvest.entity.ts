import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Crop } from "./crop.entity";
import { Farm } from "./farm.entity";

@Entity('harvests')
export class Harvest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  year: number;

  @ManyToOne(() => Farm, (farm) => farm.harvests, { onDelete: 'CASCADE' })
  farm: Farm;

  @OneToMany(() => Crop, (crop) => crop.harvest, { onDelete: 'CASCADE' })
  crops: Crop[];
}