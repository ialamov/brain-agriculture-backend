import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from "typeorm";
import { Farm } from "./farm.entity";

@Entity('farmers')
export class Farmer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    unique: true,
    nullable: true,
  })
  cpf: string;

  @Column({ 
    unique: true,
    nullable: true,
  })
  cnpj: string;

  @Column()
  name: string;

  @OneToMany(() => Farm, (farm) => farm.farmer)
  farm: Farm[];
}