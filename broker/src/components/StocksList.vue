<template>
  <div class="stocks-list">
    <div v-for="stock in stocks" :key="stock.id" class="stock">
      <div class="row-gap16 stock__heading">
        <img class="round-img stock__img"
             :src="getImageUrl(stock.id)"
             @error="handleImageError($event)"
        >
        <p class="text">{{ stock.id }}</p>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'StocksList',
  data() {
    return {
      stocks: [],
      loading: false,
      errorMassage: null
    };
  },
  mounted() {
    this.fetchStocks();
  },
  methods: {
    async fetchStocks() {
      this.loading = true;
      this.errorMassage = null;

      try {
        const { hostname, protocol } = window.location;
        const url = `${protocol}//${hostname}:3001/stocks`;
        const response = await axios.get(url);
        this.stocks = response.data.stocks;
      } catch (error) {
        console.errorMassage('Ошибка при получении данных:', error);
        this.errorMassage = 'Не удалось загрузить данные';
      } finally {
        this.loading = false;
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
