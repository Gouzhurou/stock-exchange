import { Module } from '@nestjs/common';
import {BrokersModule} from "./brokers/brokers.module";
import {StocksModule} from "./stocks/stocks.module";
import {ImagesModule} from "./images/images.module";
import {AuthorizationModule} from "./authorization/authorization.module";
import {TradingModule} from "./trading/trading.module";

@Module({
  imports: [BrokersModule, StocksModule, ImagesModule, AuthorizationModule, TradingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
