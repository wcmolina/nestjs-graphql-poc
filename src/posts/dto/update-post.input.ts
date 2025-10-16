import { InputType, Field } from '@nestjs/graphql';
import { z } from 'zod';

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200)
    .optional(),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .optional(),
  published: z.boolean().optional(),
});

export type UpdatePostDto = z.infer<typeof updatePostSchema>;

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  published?: boolean;
}
