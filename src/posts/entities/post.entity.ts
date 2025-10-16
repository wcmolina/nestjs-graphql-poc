import { Entity, PrimaryKey, Property, ManyToOne, Opt } from '@mikro-orm/core';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Post {
  @PrimaryKey()
  id!: number;

  @Property()
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @Property({ default: false })
  published: boolean & Opt = false;

  @ManyToOne(() => User)
  author!: User;

  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}
