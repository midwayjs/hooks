const { Framework } = require('@midwayjs/koa')
const { Bootstrap } = require('@midwayjs/bootstrap')

const web = new Framework().configure({
  port: 7001,
})

Bootstrap.load(web).run()
