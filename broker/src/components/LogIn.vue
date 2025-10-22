  <template>
    <div class="login-container">
      <div class="input-block">
        <p class="input__title">Введите имя</p>
        <input
            class="input"
            type="text"
            placeholder="Name"
            v-model="brokerName"
            @keyup.enter="login"
        >
        <button class="button login-button" @click="login">Войти</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>
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
            this.$store.dispatch('login', data.broker);
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
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  font-weight: 500;
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
.login-button {
  width: 100%;
}
.error-message {
  font-size: 16px;
  font-weight: 400;
  color: #AC0000;
}
</style>
