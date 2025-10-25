<template>
  <div class="stocks-list">
    <div
        v-for="stock in stocks"
        :key="stock.id"
        class="stock table-row"
        :class="{ 'active-stock': activeStockId === stock.id }"
        @click="handleStockClick(stock)"
    >
      <div class="row-gap16 stock__heading">
        <img class="round-img stock__img"
             :src="getImageUrl(stock.id)"
             @error="handleImageError($event)"
        >
        <p class="text">{{ stock.id }}</p>
      </div>

      <p
          class="text"
          :class="{ 'price': stockPrices[stock.id] }"
      >{{ stockPrices[stock.id] ? stockPrices[stock.id].currentPrice : "" }}</p>

      <p
          class="text"
          :class="stockPrices[stock.id] && stockPrices[stock.id].difference > 0 ? 'green-text' : 'red-text'"
      >{{ stockPrices[stock.id] ? stockPrices[stock.id].difference : "" }}</p>

    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'StocksList',
  props: {
    stockPrices: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      stocks: [],
      loading: false,
      errorMessage: null,
      activeStockId: null,
    };
  },
  mounted() {
    this.fetchStocks();
  },
  methods: {
    async fetchStocks() {
      this.loading = true;
      this.errorMessage = null;

      try {
        const { hostname, protocol } = window.location;
        const url = `${protocol}//${hostname}:3001/stocks`;
        const response = await axios.get(url);
        this.stocks = response.data.stocks;
        this.getActiveStockId();
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        this.errorMessage = 'Не удалось загрузить данные';
      } finally {
        this.loading = false;
      }
    },
    getActiveStockId() {
      const stock = this.stocks.find(s => s.hasChartDisplay);
      if (stock) {
        this.activeStockId = stock.id;
      }
    },
    async handleStockClick(stock) {
      try {
        this.errorMessage = null;
        const hasChartDisplay = !stock.hasChartDisplay;

        const updatedStock = {
          ...stock,
          hasChartDisplay: hasChartDisplay
        };

        const { hostname, protocol } = window.location;
        const url = `${protocol}//${hostname}:3001/stocks/${stock.id}`;
        const response = await axios.put(url, updatedStock);

        if (response.data.success) {
          this.stocks = this.stocks.map(stock => ({
            ...stock,
            hasChartDisplay: false
          }));

          const stockIndex = this.stocks.findIndex(s => s.id === stock.id);
          if (stockIndex !== -1) {
            this.stocks[stockIndex] = updatedStock;
            this.activeStockId = hasChartDisplay ? stock.id : null;
          }
          console.log(`Chart display for stock ${stock.id} updated to: ${updatedStock.hasChartDisplay}`);
        }
      } catch (error) {
        console.error('Ошибка при обновлении акции:', error);
        this.errorMessage = 'Не удалось обновить акцию';
      }
    },
    getImageUrl(stockId) {
      return `/images/${stockId}.jpg`;
    },
    handleImageError(event) {
      event.target.src = '/images/question.jpg';
    }
  }
}
</script>

<style>
.stocks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stock {
  padding: 16px 8px;
  box-sizing: border-box;
  background-color: #fff;
}
.stock:hover {
  transform: scale(1.05);
}
.active-stock {
  box-shadow: 0 8px 15px rgba(240, 199, 0, 0.5);
}
.round-img {
  border-radius: 50%;
  object-fit: cover;
}
.stock__img {
  width: 32px;
  height: 32px;
}
.stock__heading {
  align-items: center;
}
</style>
