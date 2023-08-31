import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity({ name: "messages" })
export class MessageEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    nullable: false,
    enum: ["system", "user", "assistant"],
  })
  sender!: string;

  @Column({
    nullable: false,
  })
  content!: string;

  @ManyToOne(() => UserEntity, (user) => user.messages)
  user!: UserEntity;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;
}
