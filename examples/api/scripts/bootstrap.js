const { Bootstrap } = require('@midwayjs/bootstrap');
const { resolve } = require('path');

Bootstrap.configure({
  baseDir: resolve(__dirname, '../dist'),
})
  .run()
  .then(() => {
    console.log('Your application is running at http://localhost:7001');
  });
