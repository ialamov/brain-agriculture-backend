import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Harvest } from "./harvest.entity";

@Entity('crops')
export class Crop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Harvest, (haverst) => haverst.crops, { onDelete: 'CASCADE' })
  harvest: Harvest;
}