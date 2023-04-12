import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Carts, Status } from '../../database/entities/carts.entity';
import { v4 } from 'uuid';
import { Cart, CartItem } from '../models';
import { CartItems } from '../../database/entities/cart-items.entity';
import { findIndex } from 'rxjs';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Carts)
    private readonly cartsRepository: Repository<Carts>,
    @InjectRepository(CartItems)
    private readonly cartItemsRepository: Repository<CartItems>,
  ) {}

  private userCarts: Record<string, Cart> = {};

  async findByUserId(userId: string): Promise<Carts | undefined> {
    console.log('findByUserId', 'userId', userId);
    console.log('findByUserId', 'this.cartsRepository', this.cartsRepository);
    console.log('findByUserId', 'Carts', Carts);

    const carts = await this.cartsRepository.findOne({
      where: {
        userId,
        status: Status.Open,
      },
      relations: ['cartItems'],
    });

    console.log('findByUserId', '[carts]', carts);

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

  async updateByUserId(
    userId: string,
    { cartItems: cartItemsUpdated }: { cartItems: CartItems },
  ): Promise<Carts> {
    const { id, cartItems, ...rest } = await this.findOrCreateByUserId(userId);
    let cartItemsUpdatedEffective = {
      ...cartItemsUpdated,
      count: cartItemsUpdated.count >= 0 ? cartItemsUpdated.count : 0,
      cartId: id,
      price: 1,
    };
    let cartItemsNext = cartItems;

    const cartItemIndex = cartItems.findIndex(
      cartItems => cartItems.productId === cartItemsUpdatedEffective.productId,
    );

    if (cartItemIndex >= 0) {
      cartItemsUpdatedEffective = {
        ...cartItemsUpdatedEffective,
        id: cartItemsNext[cartItemIndex].id,
      };

      cartItemsNext.splice(cartItemIndex, 1, cartItemsUpdatedEffective);

      console.log('cartItemsNext', cartItemsNext);
    } else {
      cartItemsNext.push(cartItemsUpdatedEffective);
      console.log('cartItemsNext', cartItemsNext);
    }

    const updatedCart = {
      id,
      ...rest,
      updatedAt: new Date().toISOString(),
      cartItems: cartItemsNext,
    };

    console.log('save', updatedCart);

    // const carts = await this.cartsRepository.upsert(updatedCart, {
    //   upsertType: 'on-conflict-do-update',
    //   conflictPaths: {
    //     id: true,
    //     userId: true,
    //     createdAt: true,
    //     updatedAt: true,
    //     status: true,
    //   },
    // });

    await this.cartsRepository.save(updatedCart);

    if (!cartItemsUpdatedEffective.count) {
      console.log(
        'delete',
        'cartItemsUpdatedEffective.id',
        cartItemsUpdatedEffective.id,
      );
      await this.cartItemsRepository.delete(cartItemsUpdatedEffective.id);
    }

    return { ...updatedCart };
  }

  removeByUserId(userId): void {
    this.userCarts[userId] = null;
  }
}
