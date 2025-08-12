import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Harvest } from "./harvest.entity";
import { Farm } from "./farm.entity";

@Entity('crops')
export class Crop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'harvestId' })
  harvestId: string;

  @Column({ name: 'farmId' })
  farmId: string;

  @ManyToOne(() => Harvest, (harvest) => harvest.crops, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'harvestId' })
  harvest: Harvest;
  
  @ManyToOne(() => Farm, (farm) => farm.crops, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmId' })
  farm: Farm;
}