import { FastifyReply, FastifyRequest } from 'fastify'
import { useKnex } from '../../database/knex'

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { sessionId } = request.cookies

  if (!sessionId) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const user = await useKnex('users')
    .where({ session_id: sessionId })
    .select()
    .first()

  if (!user) {
    return reply
      .status(401)
      .send({ error: 'You dont have permissions to execute this action' })
  }

  request.user = user
}
