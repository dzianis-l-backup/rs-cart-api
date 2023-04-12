import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  HttpStatus,
} from '@nestjs/common';

import { OrderService } from './services';
import { AppRequest } from '../shared';

@Controller('api/profile/order')
export class OrdersController {
  constructor(private orderService: OrderService) {}

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest) {
    const orders = await this.orderService.getAll();

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { orders },
    };
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Put()
  async submitOrder(@Body() body) {
    // TODO: validate body payload...
    console.log('submitOrder', 'body', body);
    const orders = await this.orderService.update(body);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        orders,
      },
    };
  }
}
