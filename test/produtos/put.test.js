const chai = require('chai')
const faker = require('faker')

const rotaProdutos = '/produtos'
const utils = require('../utils')

describe(rotaProdutos + ' PUT', () => {
  let authorizationAdministrador
  before(async () => {
    const { email, password } = await utils.cadastrarUsuario({ administrador: 'true' })
    const { authorization } = await utils.login(email, password)
    authorizationAdministrador = authorization
  })

  it('Registro alterado', async () => {
    const produto = {
      nome: faker.commerce.productName(),
      preco: faker.random.number(),
      descricao: faker.random.words(),
      quantidade: faker.random.number()
    }

    const { body } = await request
      .post(rotaProdutos)
      .send(produto)
      .set('authorization', authorizationAdministrador)
      .expect(201)
    const { body: bodyPut } = await request
      .put(`${rotaProdutos}/${body._id}`)
      .send(produto)
      .set('authorization', authorizationAdministrador)
      .expect(200)

    chai.assert.deepEqual(bodyPut, { message: 'Registro alterado com sucesso' })
  })

  it('Cadastro com sucesso', async () => {
    const { body } = await request.put(rotaProdutos + '/a').send({
      nome: faker.commerce.productName(),
      preco: faker.random.number(),
      descricao: faker.random.words(),
      quantidade: faker.random.number()
    })
      .set('authorization', authorizationAdministrador)
      .expect(201)

    chai.assert.deepEqual(body, { message: 'Cadastro realizado com sucesso', _id: body._id })
  })

  it('Nome já utilizado', async () => {
    const produto = {
      nome: faker.commerce.productName(),
      preco: faker.random.number(),
      descricao: faker.random.words(),
      quantidade: faker.random.number()
    }

    await request
      .post(rotaProdutos)
      .send(produto)
      .set('authorization', authorizationAdministrador)
      .expect(201)
    const { body } = await request
      .put(`${rotaProdutos}/a`)
      .send(produto)
      .set('authorization', authorizationAdministrador)
      .expect(400)

    chai.assert.deepEqual(body, { message: 'Já existe produto com esse nome' })
  })

  it('Token inválido', async () => {
    const { body } = await request.put(`${rotaProdutos}/a`).send({
      nome: faker.commerce.productName(),
      preco: faker.random.number(),
      descricao: faker.random.words(),
      quantidade: faker.random.number()
    }).set('authorization', 'a').expect(401)

    chai.assert.deepEqual(body, {
      message: 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais'
    })
  })

  it('Rota para administradores', async () => {
    const { email, password } = await utils.cadastrarUsuario({ administrador: 'false' })
    const { authorization } = await utils.login(email, password)
    const { body } = await request.put(`${rotaProdutos}/a`).send({
      nome: faker.commerce.productName(),
      preco: faker.random.number(),
      descricao: faker.random.words(),
      quantidade: faker.random.number()
    }).set('authorization', authorization).expect(403)

    chai.assert.deepEqual(body, {
      message: 'Rota exclusiva para administradores'
    })
  })

  it('Bad request', async () => {
    const { body } = await request
      .put(rotaProdutos + '/a')
      .send({ inexistente: '1' })
      .set('authorization', authorizationAdministrador)
      .expect(400)

    chai.assert.deepEqual(body, {
      error: {
        name: 'ValidationError',
        message: 'Validation Failed',
        statusCode: 400,
        error: 'Bad Request',
        details: [{
          nome: '"nome" is required',
          preco: '"preco" is required',
          descricao: '"descricao" is required',
          quantidade: '"quantidade" is required',
          inexistente: '"inexistente" is not allowed'
        }]
      }
    })
  })
})
