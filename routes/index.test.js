const request = require('supertest')
const app = require('../app')

describe('GET /index', () => {
  afterEach(() => {
    jest.resetModules()
    jest.restoreAllMocks()
  })

  test('Express is found on the page', () => {
    return request(app)
      .get('/')
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.text).toMatch(/Express/)
      })
  })

  // This is a little bit hack but at least we get 100% coverage on index.js
  test('should render views', () => {
    const express = require('express')
    const mRouter = { get: jest.fn() }
    jest.spyOn(express, 'Router').mockImplementationOnce(() => mRouter)
    const mReq = {}
    const mRes = { render: jest.fn() }
    const mNext = jest.fn()
    mRouter.get.mockImplementation((path, callback) => {
      if (path === '/') {
        callback(mReq, mRes, mNext)
      }
    })
    require('./index')
    expect(mRes.render).toBeCalledWith('index', { title: 'Express' })
  })
})
