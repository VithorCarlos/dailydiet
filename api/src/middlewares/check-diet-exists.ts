import { z } from 'zod'
import { useKnex } from '../../database/knex'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkDietExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsShema = z.object({
    dietId: z.string(),
  })
  const { dietId } = paramsShema.parse(request.params)

  const diet = await useKnex('diets')
    .select()
    .where({ id: Number(dietId), user_id: request.user?.id })
    .first()

  if (!diet) {
    return reply.status(404).send({ error: 'Diet not found' })
  }
}
