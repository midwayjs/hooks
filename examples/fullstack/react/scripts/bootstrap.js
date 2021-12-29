const { Bootstrap } = require('@midwayjs/bootstrap');
const path = require('path');

Bootstrap.configure({
  baseDir: path.resolve(__dirname, '../dist/server'),
})
  .run()
  .then(() => {
    console.log('Your application is running at http://localhost:7001');
  });
