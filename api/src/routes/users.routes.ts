import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { useKnex } from '../../database/knex'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-sessions-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const user = await useKnex('users').select().first()

      return reply.send({ user })
    },
  )

  app.post('/', async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = createUserSchema.parse(request.body)

    let { sessionId } = request.cookies

    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        secure: true,
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    const user = await useKnex('users').where({ email }).select().first()

    if (user) {
      reply.status(401).send({ message: 'Users Already Exists' })
    }

    await useKnex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.post('/login', async (request, reply) => {
    const loginUserSchema = z.object({
      email: z.string(),
    })

    const { email } = loginUserSchema.parse(request.body)

    const user = await useKnex('users').where({ email }).select().first()

    if (!user) {
      reply.status(401).send({ message: 'User not found' })
    }

    const sessionId = randomUUID()

    reply.cookie('sessionId', sessionId, {
      path: '/',
      secure: true,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    await useKnex('users').where({ email }).update({ session_id: sessionId })

    return reply.send({ message: 'Logged with email: ' + user?.email })
  })
}
