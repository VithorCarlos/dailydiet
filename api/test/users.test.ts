import { afterAll, beforeAll, beforeEach, it, describe, expect } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'child_process'
import request from 'supertest'

describe('User routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run migrate:drop')
    execSync('npm run migrate:up')
  })

  it('Should be able to create a new user', async () => {
    const user = {
      name: 'John Donn',
      email: 'john@donn.com',
    }

    await request(app.server).post('/users').send(user).expect(201)
  })

  it('Should be able to get a user', async () => {
    const user = {
      name: 'John Donn',
      email: 'john@donn.com',
    }

    const createUser = await request(app.server)
      .post('/users')
      .send(user)
      .expect(201)

    const cookie = createUser.get('Set-Cookie')

    const getUserResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookie)

    expect(getUserResponse.body.user).toEqual(
      expect.objectContaining({ name: 'John Donn', email: 'john@donn.com' }),
    )
  })

  it('Should be able to login with email', async () => {
    const user = {
      name: 'John Donn',
      email: 'john@donn.com',
    }

    await request(app.server).post('/users').send(user).expect(201)

    const getLoginResponse = await request(app.server)
      .post('/users/login')
      .send({ email: user.email })

    expect(getLoginResponse.body.message).toEqual(
      'Logged with email: ' + user.email,
    )
  })
})
