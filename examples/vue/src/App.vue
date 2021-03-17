<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <p>Backend Api Message: {{ message }}</p>
  <button @click="send">Send message to backend</button>
  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import HelloWorld from './components/HelloWorld.vue';
import api, { post } from './apis/lambda';

export default defineComponent({
  name: 'App',
  components: {
    HelloWorld,
  },
  methods: {
    async send() {
      const message = window.prompt('Please input your message');
      const response = await post(message);
      window.alert(JSON.stringify(response));
    },
  },
  setup() {
    const message = ref('');
    onMounted(async () => {
      const response = await api();
      message.value = JSON.stringify(response);
    });
    return {
      message,
    };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
