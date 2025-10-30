<template>
  <div v-if="activeStockId && isTradingActive" class="column-gap16">
    <div  class="sb-container intro-container">
      <div class="row-gap16">
        <img class="round-img main-stock__img"
             :src="imageUrl"
             @error="handleImageError($event)"
        >
        <div class="intro-container__content">
          <p class="text">{{ currentStockInfo.name }}</p>
          <p class="grey-text">{{ currentStockInfo.id }}</p>
        </div>
      </div>
      <div v-if="currentStockData" class="intro-container__content">
        <p class="text price right-text">{{ currentPrice }}</p>
        <p
            class="text right-text"
            :class="currentStockData.difference ?
            (currentStockData.difference >= 0 ? 'green-text price' : 'red-text price') :
            ''"
        >{{ currentStockData.difference }}</p>
      </div>
    </div>

    <div class="sb-container">
      <div class="column-gap16">
        <p class="text">Количество</p>
        <p class="text">{{ currentStockCount }}</p>
      </div>
      <div class="column-gap16">
        <p class="text right-text">Общая стоимость</p>
        <div>
          <p class="text right-text price">{{ currentStockTotalPrice }}</p>
          <p v-if="currentStockData && currentStockCount"
             class="text right-text price"
             :class="totalDifference >= 0 ? 'green-text' : 'red-text' "
          >{{ totalDifference }}</p>
        </div>
      </div>
    </div>

    <div class="sb-container row-gap16">
      <button
          class="button full-width-button green-button"
          @click="handleBuy"
          :disabled="!countInput || countInput <= 0"
      >Покупка</button>
      <button
          class="button full-width-button red-button"
          @click="handleSell"
          :disabled="!countInput || countInput <= 0"
      >Продажа</button>
    </div>
    <input
        class="input"
        type="number"
        placeholder="Count"
        v-model.number="countInput"
        min="1"
    >
  </div>
  <div v-if="!activeStockId">
    <p>Выберите акцию для отображения графика</p>
  </div>
  <div v-if="activeStockId && !isTradingActive">
    <p>Торги еще не начались</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'StockChart',
  props: {
    stockPrices: {
      type: Object,
      required: true,
      default: () => ({})
    },
    isTradingActive: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      priceHistory: {},
      lastProcessedData: {},
      defaultImgUrl: '/images/question.jpg',
      currentStockInfo: {},
      stocks: [],
      countInput: null,
    }
  },
  async mounted() {
    await this.fetchStocks();
    if (this.activeStockId) {
      this.fetchStockInfo();
    }
  },
  beforeUnmount() {
    this.stocks = [];
  },
  computed: {
    activeStockId() {
      return this.$store.getters.activeStockId;
    },
    activeStockData() {
      if (!this.activeStockId || !this.priceHistory[this.activeStockId]) {
        return [];
      }
      return this.priceHistory[this.activeStockId];
    },
    currentStockData() {
      if (!this.activeStockId || !this.activeStockData || this.activeStockData.length === 0) {
        return;
      }

      return this.activeStockData[this.activeStockData.length - 1];
    },
    currentPrice() {
      if (this.currentStockData) {
        return this.currentStockData.currentPrice;
      }
      return null;
    },
    imageUrl() {
      return `/images/${this.activeStockId}.jpg`
    },
    protocol() {
      return window.location.protocol;
    },
    hostname() {
      return window.location.hostname;
    },
    broker() {
      return this.$store.getters.currentBroker;
    },
    currentStockCount() {
      if (!this.broker.stocks[this.activeStockId])
        return 0;

      return this.broker.stocks[this.activeStockId].count;
    },
    currentStockStartPrice() {
      if (!this.broker.stocks[this.activeStockId])
        return 0;

      return this.broker.stocks[this.activeStockId].price;
    },
    currentStockTotalPrice() {
      if (!this.currentPrice) {
        return 0;
      }
      return Number((this.currentStockCount * this.currentPrice).toFixed(2));
    },
    totalDifference() {
      if (!this.currentPrice) {
        return 0;
      }

      return (this.currentStockCount * this.currentPrice - this.currentStockStartPrice).toFixed(2);
    },
    transactionTotal() {
      if (!this.currentPrice || !this.countInput) {
        return 0;
      }
      return this.currentPrice * this.countInput;
    }
  },
  watch: {
    stockPrices: {
      handler(newPrices) {
        this.updatePriceHistory(newPrices);
      },
      deep: true,
      immediate: true
    },
    isTradingActive(newValue, oldValue) {
      if (oldValue === true && newValue === false) {
        this.clearHistory();
      }
    },
    activeStockId: {
      handler(newStockId) {
        if (newStockId) {
          this.fetchStockInfo();
        } else {
          this.currentStockInfo = {};
        }
      },
      immediate: true
    }
  },
  methods: {
    async fetchStocks() {
      try {
        const url = `${this.protocol}//${this.hostname}:3001/stocks`;
        const response = await axios.get(url);
        this.stocks = response.data.stocks;
      } catch (err) {
        console.error('Ошибка при загрузке информации об акциях:', err);
        this.stocks = [];
      }
    },

    fetchStockInfo() {
      if (!Array.isArray(this.stocks) || this.stocks.length === 0) {
        return;
      }
      this.currentStockInfo = this.stocks.find((stock) => stock.id === this.activeStockId);
      if (!this.currentStockInfo) {
        console.warn(`Акция с ID ${this.activeStockId} не найдена в локальном списке`);
      }
    },

    updatePriceHistory(newPrices) {
      Object.keys(newPrices).forEach(stockId => {
        const stockData = newPrices[stockId];

        if (!stockData || !stockData.currentPrice || !stockData.date) return;

        const dataKey = `${stockId}_${stockData.date}_${stockData.currentPrice}`;
        if (this.lastProcessedData[stockId] === dataKey) {
          return;
        }
        this.lastProcessedData[stockId] = dataKey;

        if (!this.priceHistory[stockId]) {
          this.priceHistory[stockId] = [];
        }

        this.priceHistory[stockId].push(stockData);
      });
    },

    clearHistory() {
      this.priceHistory = {};
      this.lastProcessedData = {};
    },

    handleImageError(event) {
      event.target.src = this.defaultImgUrl;
    },

    async handleBuy() {
      if (!this.currentPrice) {
        alert('Невозможно получить текущую цену акции');
        this.countInput = null;
        return;
      }

      const totalCost = this.transactionTotal;

      if (this.broker.balance < totalCost) {
        alert('Недостаточно средств для покупки');
        this.countInput = null;
        return;
      }

      try {
        const newBalance = Number((this.broker.balance - totalCost).toFixed(2));
        const updatedBroker = {
          ...this.broker,
          balance: newBalance,
        };
        console.log(`balance: ${this.broker.balance}`);
        console.log(`new balance: ${newBalance}`);

        const currentStock = updatedBroker.stocks[this.activeStockId];

        if (currentStock) {
          updatedBroker.stocks[this.activeStockId] = {
            count: currentStock.count + this.countInput,
            price: Number((currentStock.price + totalCost).toFixed(2))
          };
        } else {
          updatedBroker.stocks[this.activeStockId] = {
            count: this.countInput,
            price: totalCost
          };
        }

        const url = `${this.protocol}//${this.hostname}:3001/brokers/${this.broker.id}`;
        const response = await axios.put(url, updatedBroker);

        if (response.status === 200) {
          this.$store.dispatch('updateBroker', updatedBroker);
          alert(`Успешно куплено ${this.countInput} акций ${this.activeStockId} по цене ${totalCost}`);
          this.countInput = null;
        } else {
          alert('Ошибка при обновлении данных брокера');
        }

      } catch (error) {
        console.error('Ошибка при покупке акций:', error);
        alert('Произошла ошибка при покупке акций');
      }
    },

    async handleSell() {
      if (this.countInput > this.currentStockCount) {
        alert('Недостаточно акций для продажи');
        this.countInput = null;
        return;
      }

      if (!this.currentPrice) {
        alert('Невозможно получить текущую цену акции');
        this.countInput = null;
        return;
      }

      try {
        const totalRevenue = this.transactionTotal;

        const newBalance = Number((this.broker.balance + totalRevenue).toFixed(2));
        const updatedBroker = {
          ...this.broker,
          balance: newBalance,
        };
        console.log(`balance: ${this.broker.balance}`);
        console.log(`new balance: ${newBalance}`);

        const currentStock = updatedBroker.stocks[this.activeStockId];

        if (currentStock) {
          if (currentStock.count === this.countInput) {
            delete updatedBroker.stocks[this.activeStockId];
          } else {
            const remainingPrice = Number(
                (currentStock.price * (currentStock.count - this.countInput) / currentStock.count).toFixed(2)
            );

            updatedBroker.stocks[this.activeStockId] = {
              count: currentStock.count - this.countInput,
              price: remainingPrice
            };
          }
        }

        const url = `${this.protocol}//${this.hostname}:3001/brokers/${this.broker.id}`;
        const response = await axios.put(url, updatedBroker);

        if (response.status === 200) {
          this.$store.dispatch('updateBroker', updatedBroker);
          alert(`Успешно продано ${this.countInput} акций ${this.activeStockId} по цене ${totalRevenue}`);
          this.countInput = null;
        } else {
          alert('Ошибка при обновлении данных брокера');
        }

      } catch (error) {
        console.error('Ошибка при продаже акций:', error);
        alert('Произошла ошибка при продаже акций');
      }
    }

  }
};
</script>

<style scoped>
.main-stock__img {
  width: 48px;
  height: 48px;
}
.grey-text {
  font-size: 14px;
  color: #616161;
  font-weight: 500;
}
.sb-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.intro-container__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.right-text {
  text-align: right;
}
.column-gap16 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>