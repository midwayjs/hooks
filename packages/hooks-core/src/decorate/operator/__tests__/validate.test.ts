import { z } from 'zod'
import { Decorate } from '../..'
import { Post } from '../http'
import { Validate, Validator, setValidator } from '../validate'

describe('validator', () => {
  it('use default validator', async () => {
    const schema = z.number()

    const fn = Decorate(
      Post(),
      Validate(schema),
      async (count: z.infer<typeof schema>) => {
        return count
      }
    )

    expect(await fn(1)).toEqual(1)
  })

  it('should throw error', async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    })

    const fn = Decorate(
      Post(),
      Validate(schema),
      async (user: z.infer<typeof schema>) => {
        return user
      }
    )

    expect(fn({ name: 'hooks', age: 1 })).toBeTruthy()
    expect(
      fn({ name: 1, age: 1 } as any)
    ).rejects.toThrowErrorMatchingSnapshot()
    expect(
      fn({ name: '', age: '' } as any)
    ).rejects.toThrowErrorMatchingSnapshot()
  })

  it('should support custom validator', async () => {
    const validator: Validator = (schema, input) => {
      if (schema === String) {
        if (typeof input !== 'string') {
          throw new Error('input must be a string')
        }
      } else {
        throw new Error('unsupported schema')
      }
    }

    setValidator(validator)

    const fn = Decorate(Post(), Validate(String), async (name: string) => {
      return { name }
    })

    expect(await fn('hooks')).toEqual({ name: 'hooks' })
    expect(fn(1 as any)).rejects.toThrowErrorMatchingSnapshot()

    const fn2 = Decorate(Post(), Validate(Number), async (age: number) => {
      return { age }
    })
    expect(fn2(1)).rejects.toThrowErrorMatchingSnapshot()
  })
})
