import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto, createPostSchema } from './dto/create-post.input';
import { UpdatePostDto, updatePostSchema } from './dto/update-post.input';

@Injectable()
export class PostsService {
  constructor(private readonly em: EntityManager) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const validatedData = createPostSchema.parse(createPostDto);

    const author = await this.em.findOne(User, { id: validatedData.authorId });
    if (!author) {
      throw new NotFoundException(`User with ID ${validatedData.authorId} not found`);
    }

    const post = this.em.create(Post, {
      title: validatedData.title,
      content: validatedData.content,
      published: validatedData.published ?? false,
      author,
    });

    await this.em.persistAndFlush(post);

    return post;
  }

  async findAll(): Promise<Post[]> {
    return this.em.find(Post, {}, { populate: ['author'] });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.em.findOne(Post, { id }, { populate: ['author'] });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const validatedData = updatePostSchema.parse(updatePostDto);

    const post = await this.findOne(id);
    this.em.assign(post, validatedData);
    await this.em.flush();

    return post;
  }

  async remove(id: number): Promise<Post> {
    const post = await this.findOne(id);
    await this.em.removeAndFlush(post);

    return post;
  }
}
