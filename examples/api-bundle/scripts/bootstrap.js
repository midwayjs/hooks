const { Bootstrap } = require('@midwayjs/bootstrap');
const { join } = require('path');

Bootstrap.configure({
  moduleDetector: false,
  imports: require(join(__dirname, '../dist/hcc')),
})
  .run()
  .then(() => {
    console.log('Your application is running at http://localhost:7001');
  });
