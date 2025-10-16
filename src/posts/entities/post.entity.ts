import { Entity, PrimaryKey, Property, ManyToOne, Opt } from '@mikro-orm/core';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity()
export class Post {
  @Field(() => ID)
  @PrimaryKey()
  id!: number;

  @Field()
  @Property()
  title!: string;

  @Field()
  @Property({ type: 'text' })
  content!: string;

  @Field({ nullable: true })
  @Property({ default: false })
  published: boolean & Opt = false;

  @Field(() => User)
  @ManyToOne(() => User)
  author!: User;

  @Field()
  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();

  @Field()
  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}
