import { Module } from '@nestjs/common';
import {BrokersModule} from "./brokers/brokers.module";
import {StocksModule} from "./stocks/stocks.module";
import {ImagesModule} from "./images/images.module";
import {AuthorizationModule} from "./authorization/authorization.module";

@Module({
  imports: [BrokersModule, StocksModule, ImagesModule, AuthorizationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
