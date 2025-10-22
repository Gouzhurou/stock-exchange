import { Module } from '@nestjs/common';
import { BrokersController } from './brokers.controller';
import { BrokersService } from './brokers.service';
import {StocksModule} from "../stocks/stocks.module";

@Module({
    imports: [StocksModule],
    controllers: [BrokersController],
    providers: [BrokersService],
    exports: [BrokersService],
})
export class BrokersModule {}