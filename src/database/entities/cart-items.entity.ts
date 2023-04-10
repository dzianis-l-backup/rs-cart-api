import { Column, JoinColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { Carts } from './carts.entity';

@Entity()
export class CartItems {
  @PrimaryColumn('uuid')
  cart_id: string;

  @ManyToOne(
    () => Carts,
    carts => carts.cartItems,
  )
  @JoinColumn({ name: 'cart_id', referencedColumnName: 'id' })
  cart: Carts;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'int' })
  count: number;
}
