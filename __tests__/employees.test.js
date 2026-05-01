const request = require('supertest');
const app = require('../app');

jest.mock('../config/connection', () => ({ query: jest.fn() }));
const db = require('../config/connection');

afterEach(() => jest.clearAllMocks());

describe('GET /api/employees', () => {
    it('returns all employees with status 200', async () => {
        const rows = [{ id: 1, first_name: 'Joe', last_name: 'Dirt', role_id: 1, manager_id: null }];
        db.query.mockImplementation((_q, cb) => cb(null, rows));

        const res = await request(app).get('/api/employees');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(rows);
    });

    it('returns 500 on database error', async () => {
        db.query.mockImplementation((_q, cb) => cb(new Error('db error'), null));

        const res = await request(app).get('/api/employees');
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

describe('POST /api/employees', () => {
    const payload = { first_name: 'Jane', last_name: 'Doe', role_id: 2, manager_id: 1 };

    it('inserts an employee and returns result', async () => {
        const result = { insertId: 11, affectedRows: 1 };
        db.query.mockImplementation((_q, _p, cb) => cb(null, result));

        const res = await request(app).post('/api/employees').send(payload);
        expect(res.status).toBe(200);
        expect(res.body).toEqual(result);
    });

    it('passes all four fields to the query', async () => {
        db.query.mockImplementation((_q, params, cb) => cb(null, { insertId: 12 }));

        await request(app).post('/api/employees').send(payload);
        const params = db.query.mock.calls[0][1];
        expect(params).toEqual(['Jane', 'Doe', 2, 1]);
    });

    it('returns 500 on database error', async () => {
        db.query.mockImplementation((_q, _p, cb) => cb(new Error('db error'), null));

        const res = await request(app).post('/api/employees').send(payload);
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

describe('PUT /api/employees/:id', () => {
    it('updates first_name and returns result', async () => {
        const result = { affectedRows: 1 };
        db.query.mockImplementation((_q, _p, cb) => cb(null, result));

        const res = await request(app).put('/api/employees/1').send({ first_name: 'Updated' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual(result);
    });

    it('passes the correct id to the query', async () => {
        db.query.mockImplementation((_q, params, cb) => cb(null, { affectedRows: 1 }));

        await request(app).put('/api/employees/5').send({ first_name: 'Test' });
        const params = db.query.mock.calls[0][1];
        expect(params[1]).toBe('5');
    });

    it('returns 500 on database error', async () => {
        db.query.mockImplementation((_q, _p, cb) => cb(new Error('db error'), null));

        const res = await request(app).put('/api/employees/1').send({ first_name: 'X' });
        expect(res.status).toBe(500);
    });
});

describe('DELETE /api/employees/:id', () => {
    it('deletes an employee and returns result', async () => {
        const result = { affectedRows: 1 };
        db.query.mockImplementation((_q, _p, cb) => cb(null, result));

        const res = await request(app).delete('/api/employees/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(result);
    });

    it('passes id as an array to the query', async () => {
        db.query.mockImplementation((_q, params, cb) => cb(null, { affectedRows: 1 }));

        await request(app).delete('/api/employees/3');
        const params = db.query.mock.calls[0][1];
        expect(Array.isArray(params)).toBe(true);
        expect(params[0]).toBe('3');
    });

    it('returns 500 on database error', async () => {
        db.query.mockImplementation((_q, _p, cb) => cb(new Error('db error'), null));

        const res = await request(app).delete('/api/employees/1');
        expect(res.status).toBe(500);
    });
});
