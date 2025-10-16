import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User as UserEntity } from './entities/user.entity';
import { Post as PostEntity } from '../posts/entities/post.entity';
import { CreateUserInput, UpdateUserInput } from '../graphql';

@Resolver('User')
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation('createUser')
  async createUser(@Args('input') input: CreateUserInput): Promise<UserEntity> {
    // Convert GraphQL input (null) to DTO format (undefined)
    const dto = {
      name: input.name,
      email: input.email,
      bio: input.bio ?? undefined,
    };
    return this.usersService.create(dto);
  }

  @Query('users')
  async users(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }

  @Query('user')
  async user(@Args('id') id: number): Promise<UserEntity | null> {
    try {
      return await this.usersService.findOne(id);
    } catch {
      return null;
    }
  }

  @Mutation('updateUser')
  async updateUser(
    @Args('id') id: number,
    @Args('input') input: UpdateUserInput,
  ): Promise<UserEntity> {
    // Convert GraphQL input (null) to DTO format (undefined)
    const dto = {
      name: input.name ?? undefined,
      email: input.email ?? undefined,
      bio: input.bio ?? undefined,
    };
    return this.usersService.update(id, dto);
  }

  @Mutation('removeUser')
  async removeUser(@Args('id') id: number): Promise<UserEntity> {
    return this.usersService.remove(id);
  }

  @ResolveField('posts')
  async posts(@Parent() user: UserEntity): Promise<PostEntity[]> {
    // Load the collection if not already loaded
    await user.posts.loadItems();
    return user.posts.getItems();
  }
}
