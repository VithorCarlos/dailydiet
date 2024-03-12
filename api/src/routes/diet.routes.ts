import { FastifyInstance } from 'fastify'
import { checkSessionIdExists } from '../middlewares/check-sessions-id-exists'
import { useKnex } from '../../database/knex'
import { z } from 'zod'
import { checkDietExists } from '../middlewares/check-diet-exists'

export async function dietRoutes(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const diets = await useKnex('diets')
        .select()
        .where({ user_id: request.user?.id })
      return reply.status(200).send(diets)
    },
  )

  app.get(
    '/:dietId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const paramsShema = z.object({
        dietId: z.string(),
      })
      const { dietId } = paramsShema.parse(request.params)

      const diet = await useKnex('diets')
        .select()
        .where({ id: Number(dietId) })
        .first()

      if (!diet) {
        return reply.status(404).send({ error: 'Diet not found' })
      }

      return reply.status(200).send({ diet })
    },
  )

  app.get(
    '/statistics',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const totalMeals = await useKnex('diets')
        .where({
          user_id: request.user?.id,
        })
        .count('id', { as: 'total' })
        .first()

      const totalMealsOnDiet = await useKnex('diets')
        .where({
          user_id: request.user?.id,
          isInDiet: true,
        })
        .count('id', { as: 'total' })
        .first()

      const totalMealsOffDiet = await useKnex('diets')
        .where({
          user_id: request.user?.id,
          isInDiet: false,
        })
        .count('id', { as: 'total' })
        .first()

      return reply.send({
        totalMeals: totalMeals?.total,
        totalMealsOnDiet: totalMealsOnDiet?.total,
        totalMealsOffDiet: totalMealsOffDiet?.total,
      })
    },
  )

  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createDietSchema = z.object({
        name: z.string(),
        description: z.string(),
        isInDiet: z.boolean(),
      })

      const { name, description, isInDiet } = createDietSchema.parse(
        request.body,
      )

      const diet = await useKnex('diets')
        .insert({
          name,
          description,
          isInDiet,
          user_id: request.user?.id,
        })
        .returning('*')

      return reply.status(201).send({ diet })
    },
  )

  app.put(
    '/:dietId',
    {
      preHandler: [checkSessionIdExists, checkDietExists],
    },
    async (request, reply) => {
      const editDietSchema = z.object({
        name: z.string(),
        description: z.string(),
        isInDiet: z.boolean(),
      })

      const paramsShema = z.object({
        dietId: z.string(),
      })

      const { dietId } = paramsShema.parse(request.params)

      const { name, description, isInDiet } = editDietSchema.parse(request.body)

      const [diet] = await useKnex('diets')
        .where({
          id: Number(dietId),
        })
        .update({
          name,
          description,
          isInDiet,
          updated_at: useKnex.fn.now(),
        })
        .returning(['id', 'name', 'description', 'isInDiet', 'updated_at'])

      return reply.send({ diet })
    },
  )

  app.delete(
    '/:dietId',
    {
      preHandler: [checkSessionIdExists, checkDietExists],
    },
    async (request, reply) => {
      const paramsShema = z.object({
        dietId: z.string(),
      })
      const { dietId } = paramsShema.parse(request.params)

      await useKnex('diets')
        .where({ id: Number(dietId) })
        .delete()

      return reply.status(201).send()
    },
  )
}
