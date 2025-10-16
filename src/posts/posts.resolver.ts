import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { wrap } from '@mikro-orm/core';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './entities/post.entity';
import { User as UserEntity } from '../users/entities/user.entity';
import { CreatePostInput, UpdatePostInput } from '../graphql';

@Resolver('Post')
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Mutation('createPost')
  async createPost(@Args('input') input: CreatePostInput): Promise<PostEntity> {
    // Convert GraphQL input (null) to DTO format (undefined)
    const dto = {
      title: input.title,
      content: input.content,
      published: input.published ?? undefined,
      authorId: input.authorId,
    };
    return this.postsService.create(dto);
  }

  @Query('posts')
  async posts(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }

  @Query('post')
  async post(@Args('id') id: number): Promise<PostEntity | null> {
    try {
      return await this.postsService.findOne(id);
    } catch {
      return null;
    }
  }

  @Mutation('updatePost')
  async updatePost(
    @Args('id') id: number,
    @Args('input') input: UpdatePostInput,
  ): Promise<PostEntity> {
    // Convert GraphQL input (null) to DTO format (undefined)
    const dto = {
      title: input.title ?? undefined,
      content: input.content ?? undefined,
      published: input.published ?? undefined,
    };
    return this.postsService.update(id, dto);
  }

  @Mutation('removePost')
  async removePost(@Args('id') id: number): Promise<PostEntity> {
    return this.postsService.remove(id);
  }

  @ResolveField('author')
  async author(@Parent() post: PostEntity): Promise<UserEntity> {
    // Load the relation if not already loaded (ManyToOne)
    await wrap(post.author).init();
    return post.author;
  }
}
