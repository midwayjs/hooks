<script setup lang="ts">
import { ref } from 'vue';
import { getDate } from './api/date';
import fetchGithubStars from './api/star';
import { getBookByParams, getBookByQuery } from './api/book';

let date = ref('');
let repo = ref(null);
let bookByQuery = ref(null);
let bookByParams = ref(null);

getDate().then((res) => (date.value = res));
fetchGithubStars('midwayjs/midway').then((res) => (repo.value = res));
getBookByParams({ params: { id: '1' } }).then(
  (res) => (bookByParams.value = res)
);
getBookByQuery({ query: { id: '2' } }).then((res) => (bookByQuery.value = res));

// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
</script>

<template>
  <div class="app">
    <img src="/logo.png" className="logo" />
    <h2>Hello Midway Hooks</h2>
    <p style="text-align: center">
      Edit <code>src/api/*.ts</code> and watch it change.
      <br />
      You can also open Devtools to see the request details.
    </p>
    <div>
      <p>
        <span className="lambda">λ GET</span>
        <span className="lambda">getDate()</span>
        <span>Server Date: {{ date }}</span>
      </p>
      <p>
        <span className="lambda">λ POST</span>
        <span className="lambda">fetchStars('midwayjs/midway')</span>
        <span>Github Stars: {{ repo?.stars }}</span>
      </p>
      <p>
        <span className="lambda">λ GET</span>
        <span className="lambda">
          getBookByParams({ params: { id: '1' } })
        </span>
        <span>Book title: {{ bookByParams?.title }}</span>
      </p>
      <p>
        <span className="lambda">λ GET</span>
        <span className="lambda"> getBookByQuery({ query: { id: '2' } }) </span>
        <span>Book title: {{ bookByQuery?.title }}</span>
      </p>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: 'Avenir', Helvetica, Arial, -apple-system, BlinkMacSystemFont,
    'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
    'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

.app {
  min-height: 100vh;
  margin: 6rem 0;
}

.logo {
  width: 300px;
}

.app {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lambda {
  display: inline-block;
  box-sizing: border-box;
  padding: 4px 8px;
  background-color: #e3e3e3;
  border-radius: 4px;
  margin-right: 8px;
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
</style>
