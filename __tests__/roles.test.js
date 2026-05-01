const request = require('supertest');
const app = require('../app');

jest.mock('../config/connection', () => ({ query: jest.fn() }));
const db = require('../config/connection');

afterEach(() => jest.clearAllMocks());

describe('GET /api/roles', () => {
    it('returns all roles with status 200', async () => {
        const rows = [
            { id: 1, title: 'sales manager', salary: 50000, department_id: 1 },
            { id: 2, title: 'dev manager', salary: 60000, department_id: 2 },
        ];
        db.query.mockImplementation((_q, cb) => cb(null, rows));

        const res = await request(app).get('/api/roles');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(rows);
    });

    it('returns 500 on database error', async () => {
        db.query.mockImplementation((_q, cb) => cb(new Error('db error'), null));

        const res = await request(app).get('/api/roles');
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

describe('POST /api/roles', () => {
    const payload = { title: 'engineer', salary: 90000, department_id: 2 };

    it('inserts a role and returns result', async () => {
        const result = { insertId: 11, affectedRows: 1 };
        db.query.mockImplementation((_q, _p, cb) => cb(null, result));

        const res = await request(app).post('/api/roles').send(payload);
        expect(res.status).toBe(200);
        expect(res.body).toEqual(result);
    });

    it('passes all three fields to the query', async () => {
        db.query.mockImplementation((_q, params, cb) => cb(null, { insertId: 12 }));

        await request(app).post('/api/roles').send(payload);
        const params = db.query.mock.calls[0][1];
        expect(params).toEqual(['engineer', 90000, 2]);
    });

    it('returns 500 on database error', async () => {
        db.query.mockImplementation((_q, _p, cb) => cb(new Error('db error'), null));

        const res = await request(app).post('/api/roles').send(payload);
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

describe('DELETE /api/roles/:id', () => {
    it('deletes a role and returns result', async () => {
        const result = { affectedRows: 1 };
        db.query.mockImplementation((_q, _p, cb) => cb(null, result));

        const res = await request(app).delete('/api/roles/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(result);
    });

    it('passes id as an array to the query', async () => {
        db.query.mockImplementation((_q, params, cb) => cb(null, { affectedRows: 1 }));

        await request(app).delete('/api/roles/7');
        const params = db.query.mock.calls[0][1];
        expect(Array.isArray(params)).toBe(true);
        expect(params[0]).toBe('7');
    });

    it('returns 500 on database error', async () => {
        db.query.mockImplementation((_q, _p, cb) => cb(new Error('db error'), null));

        const res = await request(app).delete('/api/roles/1');
        expect(res.status).toBe(500);
    });
});
