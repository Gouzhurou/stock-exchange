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
            <p class="price">{{ brokerBalance }}</p>
          </div>
        </div>
      </section>

      <section></section>

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

export default {
  name: 'BrokerPage',
  components: {StocksList},
  data() {
    return {
      socket: null,
      date: null,
      dateMsg: "00.00.0000",
      period: null,
      stocksData: {},

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

      return balance;
    },
    stocksBalance() {
      let balance = 0;
      if (!this.broker) {
        return balance;
      }

      Object.entries(this.broker.stockCount).forEach(([stockId, quantity]) => {
        if (this.stocksData[stockId] && quantity > 0) {
          const currentPrice = this.stocksData[stockId].currentPrice;
          balance += currentPrice * quantity;
        }
      });

      return balance;
    },
    totalBalance() {
      return this.stocksBalance + this.brokerBalance;
    }
  },
  methods: {
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

      this.socket.on('tradingStopped', () => {
        this.handleTradingStopped();
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from trading server');
      });
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
      this.stocksData[data.stockId] = {
        currentPrice: data.open,
        difference: data.difference,
      };

      this.date = data.date;
    },

    handleTradingStopped() {
      this.date = null;
      this.period = null;
      this.stocksData = {};
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
</style>
