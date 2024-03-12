import { afterAll, beforeAll, beforeEach, it, describe, expect } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'child_process'
import request from 'supertest'

describe('Diet routes', () => {
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

  it('Should be able to create a new meal', async () => {
    const user = {
      name: 'John Donn',
      email: 'john@donn.com',
    }

    const meal = {
      name: 'Diet test',
      description: 'Description of the diet',
      isInDiet: false,
    }

    const createUser = await request(app.server)
      .post('/users')
      .send(user)
      .expect(201)

    const cookie = createUser.get('Set-Cookie')

    const getUser = await request(app.server)
      .get('/users')
      .set('Cookie', cookie)

    const dietCreated = await request(app.server)
      .post('/diets')
      .set('Cookie', cookie)
      .send(meal)

    expect(dietCreated.body.diet).toEqual([
      expect.objectContaining({
        id: 1,
        name: 'Diet test',
        description: 'Description of the diet',
        user_id: getUser.body.user.id,
      }),
    ])
  })

  it('Should be able to get all diets', async () => {
    const user = {
      name: 'John Donn',
      email: 'john@donn.com',
    }

    const meals = [
      {
        name: 'Diet test',
        description: 'Description of the diet',
        isInDiet: false,
      },
      {
        name: 'Diet test2',
        description: 'Description of the diet2',
        isInDiet: true,
      },
    ]

    const createUser = await request(app.server)
      .post('/users')
      .send(user)
      .expect(201)

    const cookie = createUser.get('Set-Cookie')

    meals.map(async (meal) => {
      await request(app.server).post('/diets').set('Cookie', cookie).send(meal)
    })

    const getDietResponse = await request(app.server)
      .get('/diets')
      .set('Cookie', cookie)

    const allDiets = getDietResponse.body.map(
      (diet: { name: string; description: string; isInDiet: number }) => ({
        name: diet.name,
        description: diet.description,
        isInDiet: diet.isInDiet === 1,
      }),
    )

    expect(allDiets).toEqual(expect.arrayContaining(meals))
  })

  it('Should be able to get one diet', async () => {
    const user = {
      name: 'John Donn',
      email: 'john@donn.com',
    }

    const meal = {
      name: 'Diet test',
      description: 'Description of the diet',
      isInDiet: false,
    }

    const createUser = await request(app.server)
      .post('/users')
      .send(user)
      .expect(201)

    const cookie = createUser.get('Set-Cookie')

    const dietCreated = await request(app.server)
      .post('/diets')
      .set('Cookie', cookie)
      .send(meal)

    const { id } = dietCreated.body.diet[0]

    const findDietResponse = await request(app.server)
      .get(`/diets/${id}`)
      .set('Cookie', cookie)

    expect(findDietResponse.body.diet).toEqual(
      expect.objectContaining({
        name: 'Diet test',
        description: 'Description of the diet',
      }),
    )
  })

  it('Should be able to get statistics', async () => {
    const user = {
      name: 'John Donn',
      email: 'john@donn.com',
    }

    const meals = [
      {
        name: 'Diet test',
        description: 'Description of the diet',
        isInDiet: false,
      },
      {
        name: 'Diet test2',
        description: 'Description of the diet2',
        isInDiet: true,
      },
      {
        name: 'Diet test3',
        description: 'Description of the diet3',
        isInDiet: true,
      },
    ]

    const createUser = await request(app.server)
      .post('/users')
      .send(user)
      .expect(201)

    const cookie = createUser.get('Set-Cookie')

    meals.map(async (meal) => {
      await request(app.server).post('/diets').set('Cookie', cookie).send(meal)
    })

    const getDietStatisticsResponse = await request(app.server)
      .get('/diets/statistics')
      .set('Cookie', cookie)

    expect(getDietStatisticsResponse.body).toEqual({
      totalMeals: 3,
      totalMealsOnDiet: 2,
      totalMealsOffDiet: 1,
    })
  })

  it('Should be able to update diet', async () => {
    const user = {
      name: 'John Donn',
      email: 'john@donn.com',
    }

    const meal = {
      name: 'Diet test',
      description: 'Description of the diet',
      isInDiet: false,
    }

    const updatedMeal = {
      name: 'Diet updated',
      description: 'Description updated',
      isInDiet: true,
    }

    const createUser = await request(app.server)
      .post('/users')
      .send(user)
      .expect(201)

    const cookie = createUser.get('Set-Cookie')

    const dietCreated = await request(app.server)
      .post('/diets')
      .set('Cookie', cookie)
      .send(meal)

    const { id } = dietCreated.body.diet[0]

    const updatedDietResponse = await request(app.server)
      .put(`/diets/${id}`)
      .send(updatedMeal)
      .set('Cookie', cookie)

    expect(updatedDietResponse.body.diet).toEqual(
      expect.objectContaining({
        id,
        name: updatedMeal.name,
        description: updatedMeal.description,
        isInDiet: updatedMeal.isInDiet ? 1 : 0,
      }),
    )
  })

  it('Should be able to delete a diet', async () => {
    const user = {
      name: 'John Donn',
      email: 'john@donn.com',
    }

    const meal = {
      name: 'Diet test',
      description: 'Description of the diet',
      isInDiet: false,
    }

    const createUser = await request(app.server)
      .post('/users')
      .send(user)
      .expect(201)

    const cookie = createUser.get('Set-Cookie')

    const dietCreated = await request(app.server)
      .post('/diets')
      .set('Cookie', cookie)
      .send(meal)

    const { id } = dietCreated.body.diet[0]

    await request(app.server)
      .delete(`/diets/${id}`)
      .set('Cookie', cookie)
      .expect(201)
  })
})
