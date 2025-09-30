  <template>
    <div class="input-block">
      <p class="input__title">Введите имя</p>
      <input
          class="input"
          type="text"
          placeholder="Name"
          v-model="brokerName"
          @keyup.enter="login"
      >
      <button class="button" @click="login">Войти</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </template>

  <script>
  import axios from "axios";

  export default {
    name: 'LogIn',
    data() {
      return {
        brokerName: '',
        errorMessage: ''
      }
    },
    methods: {
      async login() {
        this.errorMessage = '';

        if (!this.brokerName.trim()) {
          this.errorMessage = 'Введите имя брокера';
          return;
        }

        try {
          const response = await axios.post('/authorization/login', {
            name: this.brokerName
          });

          const data = response.data;

          if (data.success) {
            localStorage.setItem('currentBroker', JSON.stringify(data.broker));
            this.$router.push('/broker');
          } else {
            this.errorMessage = data.message;
          }
        } catch (error) {
          if (error.response) {
            if (error.response.status === 401) {
              this.errorMessage = error.response.data.message;
            }
            else {
              this.errorMessage = 'Ошибка сервера';
            }
          }
        }
      }
    }
  }
  </script>

<style>
* {
  padding: 0;
  margin: 0;
}
body {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.input-block {
  width: 30vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}
.input__title {
  font-size: 24px;
  font-weight: 600;
}
.input {
  width: 100%;
  background-color: #F6F6F6;
  border: none;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
}
.button {
  width: 100%;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  background-color: #FFD500;
  padding: 16px 64px;
  box-sizing: border-box;
}
</style>
