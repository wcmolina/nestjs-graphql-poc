import { InputType, Field } from '@nestjs/graphql';
import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  bio: z.string().max(500).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  bio?: string;
}
