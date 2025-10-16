import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from './entities/user.entity';
import { CreateUserDto, createUserSchema } from './dto/create-user.input';
import { UpdateUserDto, updateUserSchema } from './dto/update-user.input';

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const validatedData = createUserSchema.parse(createUserDto);

    const user = this.em.create(User, validatedData);
    await this.em.persistAndFlush(user);

    return user;
  }

  async findAll(): Promise<User[]> {
    return this.em.find(User, {}, { populate: ['posts'] });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.em.findOne(User, { id }, { populate: ['posts'] });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const validatedData = updateUserSchema.parse(updateUserDto);

    const user = await this.findOne(id);
    this.em.assign(user, validatedData);
    await this.em.flush();

    return user;
  }

  async remove(id: number): Promise<User> {
    const user = await this.findOne(id);
    await this.em.removeAndFlush(user);

    return user;
  }
}
