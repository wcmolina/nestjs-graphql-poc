import {
  Entity,
  PrimaryKey,
  Property,
  Collection,
  OneToMany,
  Opt,
} from '@mikro-orm/core';
import { Post } from '../../posts/entities/post.entity';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ unique: true })
  email!: string;

  @Property({ nullable: true })
  bio?: string;

  @OneToMany(() => Post, (post) => post.author)
  posts = new Collection<Post>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}
