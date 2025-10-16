import { InputType, Field, Int } from '@nestjs/graphql';
import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  published: z.boolean().optional(),
  authorId: z.number().int().positive(),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;

@InputType()
export class CreatePostInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field({ nullable: true, defaultValue: false })
  published?: boolean;

  @Field(() => Int)
  authorId: number;
}
