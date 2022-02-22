const { Bootstrap } = require('@midwayjs/bootstrap');
const { resolve } = require('path');

const baseDir = resolve(__dirname, '../dist');

Bootstrap.configure({ baseDir })
  .run()
  .then(() => {
    console.log('Your application is running at http://localhost:7001');
  });
