import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { MessageEntity } from "./message.entity";

@Entity({ name: "users" })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    name: "phone_number",
    nullable: false,
    unique: true,
  })
  phoneNumber!: string;

  @OneToMany(() => MessageEntity, (message) => message.user)
  messages!: MessageEntity[];

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;
}
