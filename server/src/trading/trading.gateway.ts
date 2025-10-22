import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3002, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:8080'],
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
})
export class TradingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clients = new Map<string, Socket>();

    handleConnection(client: Socket) {
        const clientId = client.id;
        this.clients.set(clientId, client);
        console.log(`Client connected: ${clientId}`);
        console.log(`Total clients: ${this.clients.size}`);

        client.emit('connected', {
            status: 'connected',
            clientId,
            message: 'Successfully connected to trading server'
        });
    }

    handleDisconnect(client: Socket) {
        const clientId = client.id;
        this.clients.delete(clientId);
        console.log(`Client disconnected: ${clientId}`);
        console.log(`Total clients: ${this.clients.size}`);
    }

    // React администратор запускает торги
    @SubscribeMessage('startTrading')
    handleStartTrading(client: Socket, data: any) {
        console.log('Trading started:', data);

        this.server.emit('tradingStarted', {
            type: 'TRADING_STARTED',
            data: data,
        });

        // Подтверждение администратору
        client.emit('startTradingConfirmed', {
            status: 'success',
            message: 'Trading started successfully'
        });
    }

    // React администратор обновляет цены
    @SubscribeMessage('priceUpdate')
    handlePriceUpdate(client: Socket, data: any) {
        console.log('Price update:', data);

        this.server.emit('priceUpdated', {
            type: 'PRICE_UPDATED',
            data: data,
        });
    }

    // Остановка торгов
    @SubscribeMessage('stopTrading')
    handleStopTrading(client: Socket) {
        console.log('Trading stopped');

        this.server.emit('tradingStopped', {
            type: 'TRADING_STOPPED',
            data: {
                message: 'Trading session ended'
            },
        });
    }

    // Получение списка клиентов
    @SubscribeMessage('getClients')
    handleGetClients(client: Socket) {
        const clients = Array.from(this.clients.keys());
        client.emit('clientsList', { clients });
    }
}