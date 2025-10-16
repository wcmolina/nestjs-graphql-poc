import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { Post } from './entities/post.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Post])],
  providers: [PostsService, PostsResolver],
  exports: [PostsService],
})
export class PostsModule {}
