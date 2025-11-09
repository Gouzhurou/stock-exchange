<template>
  <div class="chart-container">
    <canvas ref="chartCanvas" :width="width" :height="height"></canvas>
  </div>
</template>

<script>
export default {
  name: 'StockChart',
  props: {
    priceHistory: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      ctx: null,
      width: 400,
      height: 200,
      padding: 20
    }
  },
  mounted() {
    this.initChart();
  },
  watch: {
    priceHistory: {
      handler() {
        this.drawChart();
      },
      deep: true
    }
  },
  computed: {
    chartColor() {
      if (!this.priceHistory || this.priceHistory.length < 2) {
        return '#20AC00';
      }

      const firstPrice = this.priceHistory[0].currentPrice;
      const lastPrice = this.priceHistory[this.priceHistory.length - 1].currentPrice;

      return lastPrice >= firstPrice ? '#20AC00' : '#ac0000';
    }
  },
  methods: {
    initChart() {
      this.ctx = this.$refs.chartCanvas.getContext('2d');
      this.drawChart();
    },

    drawChart() {
      if (!this.ctx || !this.priceHistory || this.priceHistory.length === 0) return;

      this.ctx.clearRect(0, 0, this.width, this.height);

      const prices = this.priceHistory.map(item => item.currentPrice);
      const dates = this.priceHistory.map(item => {
        return item.date ? item.date.split(' ')[1] || item.date : '';
      });

      if (prices.length === 0) return;

      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice || 1;

      const chartWidth = this.width - this.padding * 2;
      const chartHeight = this.height - this.padding * 2;

      // Рисуем ось Y
      this.ctx.strokeStyle = '#ccc';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, this.padding);
      this.ctx.lineTo(this.padding, this.height - this.padding);
      this.ctx.stroke();

      // Рисуем ось X
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, this.height - this.padding);
      this.ctx.lineTo(this.width - this.padding, this.height - this.padding);
      this.ctx.stroke();

      // Рисуем линию графика
      this.ctx.strokeStyle = this.chartColor;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();

      prices.forEach((price, index) => {
        const x = this.padding + (index / (prices.length - 1 || 1)) * chartWidth;
        const y = this.height - this.padding - ((price - minPrice) / priceRange) * chartHeight;

        if (index === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      });

      this.ctx.stroke();

      // Рисуем точки
      this.ctx.fillStyle = this.chartColor;
      prices.forEach((price, index) => {
        const x = this.padding + (index / (prices.length - 1 || 1)) * chartWidth;
        const y = this.height - this.padding - ((price - minPrice) / priceRange) * chartHeight;

        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
        this.ctx.fill();
      });

      // Подписи минимального и максимального значения
      this.ctx.fillStyle = '#666';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(maxPrice.toFixed(2), this.padding - 5, this.padding + 10);
      this.ctx.fillText(minPrice.toFixed(2), this.padding - 5, this.height - this.padding - 5);

      // Подписи времени (первая и последняя)
      if (dates.length > 0) {
        this.ctx.textAlign = 'center';
        this.ctx.fillText(dates[0], this.padding, this.height - this.padding + 15);
        if (dates.length > 1) {
          this.ctx.fillText(dates[dates.length - 1], this.width - this.padding, this.height - this.padding + 15);
        }
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  background: white;
}
</style>