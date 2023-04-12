import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Orders } from '../../database/entities/orders.entity';
import { Carts, Status } from '../../database/entities/carts.entity';
// import { CartService } from '../../cart/services/cart.service';
import { getUserIdFromRequest } from '../../shared/models-rules';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    @InjectRepository(Carts)
    private readonly cartsRepository: Repository<Carts>,
  ) {}

  private async findById(orderId: string): Promise<Orders> {
    return await this.ordersRepository.findOne({
      where: {
        id: orderId,
      },
      relations: ['carts'],
    });
  }

  async create(data: Orders) {
    const userId = getUserIdFromRequest();
    // const carts = await this.cartService.findOrCreateByUserId(userId);

    // carts.status = Status.Ordered;
    // await this.cartsRepository.save(carts);

    const order = {
      userId,
      // cartId: carts.id,
      payment: { comment: 'all paid' },
      delivery: {},
      status: 'created',
      total: -1,
    };

    await this.ordersRepository.insert(order);

    return order;
  }

  async update(orders: Orders) {
    if (!orders.id) {
      throw new Error('update failed: no orderId');
    }

    await this.ordersRepository.save(await this.findById(orders.id));
  }

  async getAll() {
    const userId = getUserIdFromRequest();

    return await this.ordersRepository.find({
      where: {
        userId,
      },
    });
  }
}
