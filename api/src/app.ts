import cookie from '@fastify/cookie'
import fastify from 'fastify'
import { usersRoutes } from './routes/users.routes'
import { dietRoutes } from './routes/diet.routes'

const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(dietRoutes, {
  prefix: 'diets',
})
export { app }
