import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/save')
  createAndSave(@Request() req, @Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.createAndSave(
      createTicketDto,
      req.user.username,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    let { page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Number(limit);

    return this.ticketsService.findAll(req.user.username, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.ticketsService.findOne(id, req.user.username);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.ticketsService.remove(id, req.user.username);
  }
}
