import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class StocksService {
    private readonly dataPath = join(process.cwd(), 'data', 'stocks.json');

    getStocks() {
        const data = readFileSync(this.dataPath, 'utf8');
        return JSON.parse(data);
    }

    getStock(id: string) {
        const filePath = join(process.cwd(), 'data', 'stocks', `${id}.json`);

        const data = readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
}