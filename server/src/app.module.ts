import { Module } from '@nestjs/common';
import {BrokersModule} from "./brokers/brokers.module";
import {StocksModule} from "./stocks/stocks.module";
import {ImagesModule} from "./images/images.module";

@Module({
  imports: [BrokersModule, StocksModule, ImagesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
