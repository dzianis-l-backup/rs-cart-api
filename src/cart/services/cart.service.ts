import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Carts, Status } from '../../database/entities/carts.entity';
import { v4 } from 'uuid';
import { Cart } from '../models';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Carts)
    private readonly cartsRepository: Repository<Carts>,
  ) {}

  private userCarts: Record<string, Cart> = {};

  async findByUserId(
    userId: string = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  ): Promise<Carts | undefined> {
    // return this.userCarts[userId];
    debugger;
    console.log('findByUserId', 'userId', userId);
    console.log('findByUserId', 'this.cartsRepository', this.cartsRepository);
    console.log('findByUserId', 'Carts', Carts);

    const [carts] =
      (await this.cartsRepository.findBy({
        id: userId,
      })) || [];

    return carts;
  }

  async createByUserId(userId: string): Promise<Carts> {
    const id = v4(v4());

    const carts = {
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: Status.Open,
      cartItems: [],
    } as Carts;

    console.log('createByUserId', 'carts', carts);

    const result = await this.cartsRepository.insert(carts);
    console.log('createByUserId', 'result', result);

    return carts;
  }

  async findOrCreateByUserId(userId: string): Promise<Carts> {
    const userCart = await this.findByUserId(userId);

    console.log('findOrCreateByUserId', 'userCart', userCart);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(userId: string, { cartItems }: Carts): Promise<Carts> {
    const { id, ...rest } = await this.findOrCreateByUserId(userId);

    const updatedCart = {
      id,
      ...rest,
      cartItems: [...cartItems],
    };

    return { ...updatedCart };
  }

  removeByUserId(userId): void {
    this.userCarts[userId] = null;
  }
}
