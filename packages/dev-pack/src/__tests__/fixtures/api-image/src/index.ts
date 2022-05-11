import { Api, Get, useContext } from '@midwayjs/hooks'
import type { Context } from '@midwayjs/faas'

export default Api(Get('/'), async () => {
  const ctx = useContext<Context>()
  return {
    message: 'Hello World!',
    ip: ctx.ip,
  }
})

export const handleApi = Api(Get('/api/:id'), async () => {
  const ctx = useContext<Context>()
  return {
    id: ctx.params.id,
  }
})

export const image = Api(Get('/image'), async () => {
  const ctx = useContext()
  ctx.type = 'png'
  const base64Png =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAAAklEQVR4AewaftIAAAIySURBVO3BQW5rSQwEwSyi73/lnFkSWrTxIFryBxgRQD5I5SYJncpNEjqVLgmfVKxRxRpVrFGHFyqTkjApCZ3KEyqTktAVa1SxRhVr1OEHSXhC5YkkdCqflIQnVG6KNapYo4o1qlijijWqWKOKNerwZSpdEv5lxRpVrFHFGnX4gco3qfwmlUnFGlWsUcUadXiRhE9KQqfSJaFT6ZLQqdwk4TcVa1SxRhVr1FH5JpUuCZNUPqlYo4o1qlijDg8l4UalS8KNyo3KJyXhRuWmWKOKNapYow4vktCpdCpdEm5UbpLQqXRJuFHpktCp3CShU3kiCV2xRhVrVLFGBZA3qHRJuFF5RxLeodIloVPpknCj0hVrVLFGFWtUAGlUbpLwhEqXhN+k0iWhU7lJwo1Kl4SuWKOKNapYo45Kl4RO5UalS0KXhBuVLgmdSpeEmyR8U7FGFWtUsUbF//FFSehUuiRMUrlJQqfyRLFGFWtUsUadJHySyjtUbpLQqXRJuFHpknCj0hVrVLFGFWvU4YXKpCTcqHRJ6FS6JLxDpUtCl4R3FGtUsUYVa9ThB0l4QuWJJHQqXRKeULlJQqfSJaFTuUlCV6xRxRpVrFGHPyYJncpNErok3Kh0SbhJQqfSqXTFGlWsUcUadfgylS4JXRI6lRuVLgldEp5Q6ZJwU6xRxRpVrFGHH6j8JUm4SUKn0iXhRuVGpUtCV6xRxRpVrFGHF0n4y1TeofKOJHQqXbFGFWtUsUb9B7x87rg3rZ9/AAAAAElFTkSuQmCC'
  const png = base64Png.replace(/^data:image\/\w+;base64,/, '')
  return Buffer.from(png, 'base64')
})
