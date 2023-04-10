import { Module } from '@nestjs/common';
import { OrderService } from './services';

import {DatabaseModule} from '../database/database.module'
@Module({
  providers: [OrderService, DatabaseModule],
  exports: [OrderService],
})
export class OrderModule {}
