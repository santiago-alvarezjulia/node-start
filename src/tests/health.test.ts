import request from 'supertest'
import { app, server } from '../server'

jest.mock('mongoose', () => {
    const mockConnection = {
        on: jest.fn(),
        once: jest.fn(),
        close: jest.fn().mockResolvedValue(null)
    }

    return {
        connect: jest.fn().mockResolvedValue(mockConnection),
        connection: mockConnection,
        Schema: jest.fn().mockImplementation(() => ({})),
        model: jest.fn().mockReturnValue(function () {
            return {
                save: jest.fn().mockResolvedValue({}),
            };
        }),
    };
});

describe('Health Check', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterAll(async () => {
        server.close()
    })

    it('should return 200 and a success message', async () => {
        const response = await request(app).get('/health')
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('status', 'OK')
        expect(response.body).toHaveProperty('message', 'Server is up and running')     
    })
})
