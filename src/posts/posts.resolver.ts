import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Mutation(() => Post)
  async createPost(@Args('input') createPostInput: CreatePostInput): Promise<Post> {
    return this.postsService.create(createPostInput);
  }

  @Query(() => [Post], { name: 'posts' })
  async findAll(): Promise<Post[]> {
    return this.postsService.findAll();
  }

  @Query(() => Post, { name: 'post' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Post> {
    return this.postsService.findOne(id);
  }

  @Mutation(() => Post)
  async updatePost(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') updatePostInput: UpdatePostInput,
  ): Promise<Post> {
    return this.postsService.update(id, updatePostInput);
  }

  @Mutation(() => Post)
  async removePost(@Args('id', { type: () => Int }) id: number): Promise<Post> {
    return this.postsService.remove(id);
  }
}
