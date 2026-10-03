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
import { DemoUserGuard } from 'src/auth/demo-user.guard';
import { DeprecatedGuard } from 'src/global/guards/deprecated.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(DeprecatedGuard)
  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @UseGuards(DeprecatedGuard)
  @Post('/save')
  createAndSave(@Request() req, @Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.createAndSave(
      createTicketDto,
      req.user.username,
    );
  }
  @UseGuards(DemoUserGuard)
  @Get()
  findAll(@Request() req) {
    let { page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Number(limit);

    return this.ticketsService.findAll(req.user.username, page, limit);
  }

  @UseGuards(DemoUserGuard)
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.ticketsService.findOne(id, req.user.username);
  }

  @UseGuards(DeprecatedGuard)
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.ticketsService.remove(id, req.user.username);
  }
}
