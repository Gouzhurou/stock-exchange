<template>
  <div class="container">
    <header class="header">
      <button
          class="icon logout-button"
          :style="{ backgroundImage: `url(${ buttonBgUrl })` }"
          @mouseenter="buttonBgUrl = hoverBgUrl"
          @mouseleave="buttonBgUrl = normalBgUrl"
          @click="logout"
      ></button>
    </header>

    <div class="main">
      <section class="broker-info">
        <div class="broker-info__top broker-info__item">
          <p class="heading">{{ date ? date : dateMsg }}</p>
          <p class="heading">{{ brokerName }}</p>
          <p class="price heading">{{ totalBalance }}</p>
        </div>
        <div class="divider"></div>

        <div class="balance-block broker-info__item">
          <div
              class="icon"
              :style="{ backgroundImage: `url(${ stocksUrl })` }"
          ></div>
          <div class="balance-block__container">
            <p class="balance-block__title">Акции</p>
            <p class="price">{{ stocksBalance }}</p>
          </div>
        </div>
        <div class="divider"></div>

        <div class="balance-block broker-info__item">
          <div
              class="icon"
              :style="{ backgroundImage: `url(${ otherUrl })` }"
          ></div>
          <div class="balance-block__container">
            <p class="balance-block__title">Другое</p>
            <div class="row-gap8">
              <p class="price">{{ brokerBalance }}</p>
              <p v-if="amount" class="price"
                 :class="isDeposit ? 'green-text' : 'red-text'"
              >
                {{ isDeposit ? `+${amount}` : `-${amount}` }}
              </p>
            </div>
          </div>
        </div>

        <div class="column-gap16">
          <button class="button full-width-button green-button" @click="deposit">Пополнить</button>
          <input
              class="input"
              type="text"
              placeholder="Balance"
              v-model="balanceInput"
          >
          <button class="button full-width-button red-button" @click="withdraw">Снять</button>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>
      </section>

      <section class="chart-section">
        <StockChart
            :stockPrices="stocksData"
            :isTradingActive="isTradingActive"
            :socket="socket"
        ></StockChart>
      </section>

      <section class="table">
        <div class="headings table-row">
          <p class="table__heading">Название</p>
          <p class="table__heading">Цена</p>
          <p class="table__heading">Изм {{ period ? `, ${period}д` : "" }}</p>
        </div>

        <StocksList :stockPrices="stocksData"></StocksList>
      </section>
    </div>
  </div>
</template>

<script>
import StocksList from "@/components/StocksList.vue";
import io from 'socket.io-client';
import StockChart from "@/components/StockChart.vue";

export default {
  name: 'BrokerPage',
  components: {
    StockChart,
    StocksList
  },
  data() {
    return {
      socket: null,
      date: null,
      dateMsg: "00.00.0000",
      period: null,
      stocksData: {},
      balanceInput: '',
      errorMessage: '',
      amount: null,
      isDeposit: false,
      isTradingActive: false,

      normalBgUrl: '/logout.png',
      buttonBgUrl: '/logout.png',
      hoverBgUrl: '/hover-logout.png',
      stocksUrl: '/stocks.png',
      otherUrl: '/backpack.png',
      imagesLoaded: false,
    }
  },
  mounted() {
    this.preloadImages();
    this.connectWebSocket();
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  },
  beforeUnmount() {
    this.disconnectWebSocket();
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  },
  computed: {
    broker() {
      return this.$store.getters.currentBroker;
    },
    brokerName() {
      return this.broker ? this.broker.name : '';
    },
    brokerBalance() {
      if (!this.broker) {
        return '';
      }

      const balance = Number(this.broker.balance);
      if (isNaN(balance)) {
        return '';
      }

      return Number(balance.toFixed(2));
    },
    stocksBalance() {
      let balance = 0;
      if (!this.broker) {
        return balance;
      }

      Object.entries(this.broker.stocks).forEach(([stockId, stockData]) => {
        if (this.stocksData[stockId]) {
          const currentPrice = this.stocksData[stockId].currentPrice;
          balance += currentPrice * stockData.count;
        }
      });

      return Number(balance.toFixed(2));
    },
    totalBalance() {
      if (!this.broker) {
        return '';
      }

      return Number((this.stocksBalance + this.brokerBalance).toFixed(2));
    },
  },
  methods: {
    async deposit() {
      await this.updateBalance(true);
    },

    async withdraw() {
      await this.updateBalance(false);
    },

    setErrorMessage(message) {
      this.errorMessage = message;
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
    },

    async updateBalance(isDeposit) {
      console.log('=== UPDATE BALANCE STARTED ===');
      console.log('isDeposit:', isDeposit);
      console.log('Current broker:', this.broker);
      console.log('Current balance input:', this.balanceInput);

      const amount = parseFloat(this.balanceInput);
      console.log('Parsed amount:', amount);

      if (!amount || amount <= 0) {
        this.setErrorMessage('Пожалуйста, введите корректную сумму');
        console.log('Error: Invalid amount');
        return;
      }

      if (!this.broker) {
        this.setErrorMessage('Брокер не найден');
        console.log('Error: Broker not found');
        return;
      }

      console.log('Current broker balance:', this.brokerBalance);

      if (!isDeposit && amount > this.brokerBalance) {
        this.setErrorMessage('Недостаточно средств для списания');
        console.log('Error: Insufficient funds');
        return;
      }

      try {
        const newBalance = isDeposit
            ? this.brokerBalance + amount
            : this.brokerBalance - amount;
        console.log('New balance to set:', newBalance);

        const updatedBroker = {
          ...this.broker,
          balance: newBalance
        };
        console.log('Updated broker object:', updatedBroker);

        const { hostname, protocol } = window.location;
        const url = `${protocol}//${hostname}:3001/brokers/${this.broker.id}`;
        console.log('Request URL:', url);

        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedBroker)
        });
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok) {
          const result = await response.json();
          console.log('Server response:', result);

          if (result.success) {
            console.log('Server update successful, emitting WebSocket event');

            this.socket.emit('updateBalance', {
              brokerId: this.broker.id,
              newBalance: newBalance,
              operation: isDeposit ? 'deposit' : 'withdraw',
              amount: amount
            });

            this.balanceInput = '';
            console.log('=== UPDATE BALANCE COMPLETED SUCCESSFULLY ===');
          } else {
            this.setErrorMessage(result.errorMessage || 'Ошибка при обновлении баланса');
          }
        } else {
          this.setErrorMessage('Ошибка сервера при обновлении баланса');
          console.log('Server error, status:', response.status);
        }
      } catch (error) {
        console.error('Error updating balance:', error);
        this.setErrorMessage('Ошибка при обновлении баланса');
      }
    },

    async fetchBrokerData() {
      console.log('=== FETCHING BROKER DATA FROM SERVER ===');
      try {
        const { hostname, protocol } = window.location;
        const response = await fetch(`${protocol}//${hostname}:3001/brokers/${this.broker.id}`);
        console.log('Brokers fetch response status:', response.status);

        const updatedBroker = await response.json();
        console.log('Broker data from server:', updatedBroker);

        if (updatedBroker) {
          console.log('Dispatching updateBroker action...');
          this.$store.dispatch('updateBroker', updatedBroker);
          console.log('Store updated with new broker data');
        } else {
          console.log('Broker not found in server response');
        }
      } catch (error) {
        console.error('Error fetching broker data:', error);
      }
    },

    connectWebSocket() {
      this.socket = io('http://localhost:3002', {
        transports: ['websocket', 'polling'],
        query: {
          brokerName: this.brokerName
        }
      });

      this.socket.on('connect', () => {
        console.log('Connected to trading server');
      });

      this.socket.on('tradingStarted', (data) => {
        this.handleTradingStarted(data.data);
      });

      this.socket.on('priceUpdated', (data) => {
        this.handlePriceUpdate(data.data);
      });

      this.socket.on('balanceUpdated', (data) => {
        this.handleBalanceUpdate(data.data);
      });

      this.socket.on('tradingStopped', () => {
        this.handleTradingStopped();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from trading server');
      });
    },

    handleBalanceUpdate(data) {
      if (data.brokerId === this.broker.id) {
        this.fetchBrokerData();

        this.amount = data.amount;
        if (data.operation === 'deposit') {
          this.isDeposit = true;
        } else if (data.operation === 'withdraw') {
          this.isDeposit = false;
        }

        setTimeout(() => {
          this.amount = null;
        }, 3000);
      }
    },

    disconnectWebSocket() {
      if (this.socket) {
        this.socket.disconnect();
      }
    },

    handleTradingStarted(data) {
      this.updateTrading(data);
      this.period = data.period;
    },

    handlePriceUpdate(data) {
      this.updateTrading(data);
    },

    updateTrading(data) {
      this.isTradingActive = true;

      this.stocksData[data.stockId] = {
        currentPrice: data.open,
        difference: data.difference,
        date: data.date,
      };

      this.date = data.date;
    },

    handleTradingStopped() {
      this.date = null;
      this.period = null;
      this.stocksData = {};
      this.isTradingActive = false;
    },

    preloadImages() {
      const imageUrls = [this.hoverBgUrl];

      const loadImage = (url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
      };

      Promise.all(imageUrls.map(loadImage))
          .then(() => {
            this.imagesLoaded = true;
          })
          .catch(error => {
            console.error('Error preloading images:', error);
          });
    },

    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    },
    handleBeforeUnload(event) {
      // type 1 = reload
      if (event.currentTarget.performance.navigation.type === 1) {
        return;
      }

      this.logout();
    }
  }
}
</script>

<style>
.header {
  padding: 16px;
  box-sizing: border-box;
  position: fixed;
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
}
.main {
  padding: 64px 10%;
  box-sizing: border-box;
  background-color: #fff;
  display: grid;
  grid-template-columns: 2fr 4fr 3fr;
  gap: 24px;
}
.table {
  background-color: #f6f6f6;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;

}
.headings {
  padding: 16px;
  padding-top: 32px;
}
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
}
.table__heading {
  font-size: 16px;
  font-weight: 600;
}
.text {
  font-size: 14px;
  font-weight: 500;
}
.row-gap16 {
  display: flex;
  flex-direction: row;
  gap: 16px;
}
.icon {
  width: 32px;
  height: 32px;
  background-size: cover;
  border: none;
  background-color: #fff;
}

.logout-button {
  transition: transform 0.3s ease;
}
.logout-button:hover {
  transform: scale(1.1);
}

.broker-info__top{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding-top: 0px !important;
}
.broker-info__item {
  padding: 16px;
}
.divider {
  height: 1px;
  background-color: #616161;
  width: 100%;
}
.balance-block {
  display: flex;
  flex-direction: row;
  gap: 24px;
  align-items: center;
}
.balance-block__container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.balance-block__title {
  font-size: 16px;
  font-weight: 400;
  color: #616161;
}
.column-gap16 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.row-gap8 {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.green-button {
  background-color: #20AC00;
  color: #fff;
}
.green-button:hover {
  background-color: #1e8f00;
}
.green-button:active {
  background-color: #20AC00;
}
.red-button {
  background-color: #ac0000;
  color: #fff;
}
.red-button:hover {
  background-color: #8a0000;
}
.red-button:active {
  background-color: #ac0000;
}
.green-text {
  color: #20AC00;
}
.red-text {
  color: #ac0000;
}

.round-img {
  border-radius: 50%;
  object-fit: cover;
}
</style>
