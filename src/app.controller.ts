import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  ValidationPipe,
  ConflictException,
} from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CreateUserDto } from './users/dto/create-user.dto';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user.email, req.body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('auth/register')
  async register(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findOne(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    return this.usersService.createOne(createUserDto);
  }
}
