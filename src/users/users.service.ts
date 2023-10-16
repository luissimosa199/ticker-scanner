import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(email: string): Promise<User | undefined> {
    const users = this.usersRepository.findOne({ where: { email } });
    return users;
  }

  async createOne(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, '_id' | 'password'> | undefined> {
    const userData = {
      email: createUserDto.email,
      name: createUserDto.name,
      password: await this.hashPassword(createUserDto.password),
    };

    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);
    return this.transformUser(savedUser);
  }

  private transformUser(
    user: User | undefined,
  ): Omit<User, '_id' | 'password'> | undefined {
    if (!user) {
      return undefined;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, password, ...rest } = user;
    return rest;
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
}
