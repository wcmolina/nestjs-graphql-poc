import { InputType, Field } from '@nestjs/graphql';
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  bio: z.string().max(500).optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  bio?: string;
}
