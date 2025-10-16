import { Entity, PrimaryKey, Property, Collection, OneToMany, Opt } from '@mikro-orm/core';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from '../../posts/entities/post.entity';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryKey()
  id!: number;

  @Field()
  @Property()
  name!: string;

  @Field()
  @Property({ unique: true })
  email!: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  bio?: string;

  @Field(() => [Post])
  @OneToMany(() => Post, post => post.author)
  posts = new Collection<Post>(this);

  @Field()
  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();

  @Field()
  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}
