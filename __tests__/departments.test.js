const request = require('supertest');
const app = require('../app');

jest.mock('../config/connection', () => ({ query: jest.fn() }));
const db = require('../config/connection');

afterEach(() => jest.clearAllMocks());

describe('GET /api/departments', () => {
    it('returns all departments with status 200', async () => {
        const rows = [{ id: 1, name: 'sales' }, { id: 2, name: 'dev ops' }];
        db.query.mockImplementation((_q, cb) => cb(null, rows));

        const res = await request(app).get('/api/departments');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(rows);
    });

    it('returns 500 on database error', async () => {
        db.query.mockImplementation((_q, cb) => cb(new Error('db error'), null));

        const res = await request(app).get('/api/departments');
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

describe('POST /api/departments', () => {
    it('inserts a department and returns result', async () => {
        const result = { insertId: 6, affectedRows: 1 };
        db.query.mockImplementation((_q, _p, cb) => cb(null, result));

        const res = await request(app).post('/api/departments').send({ name: 'finance' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual(result);
    });

    it('passes name as an array to the query', async () => {
        db.query.mockImplementation((_q, params, cb) => cb(null, { insertId: 7 }));

        await request(app).post('/api/departments').send({ name: 'legal' });
        const params = db.query.mock.calls[0][1];
        expect(Array.isArray(params)).toBe(true);
        expect(params[0]).toBe('legal');
    });

    it('returns 500 on database error', async () => {
        db.query.mockImplementation((_q, _p, cb) => cb(new Error('db error'), null));

        const res = await request(app).post('/api/departments').send({ name: 'finance' });
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

describe('PUT /api/departments/:id', () => {
    it('updates a department name and returns result', async () => {
        const result = { affectedRows: 1 };
        db.query.mockImplementation((_q, _p, cb) => cb(null, result));

        const res = await request(app).put('/api/departments/1').send({ name: 'Sales' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual(result);
    });

    it('passes the correct name and id to the query', async () => {
        db.query.mockImplementation((_q, params, cb) => cb(null, { affectedRows: 1 }));

        await request(app).put('/api/departments/2').send({ name: 'DevOps' });
        const params = db.query.mock.calls[0][1];
        expect(params[0]).toBe('DevOps');
        expect(params[1]).toBe('2');
    });

    it('returns 500 on database error', async () => {
        db.query.mockImplementation((_q, _p, cb) => cb(new Error('db error'), null));

        const res = await request(app).put('/api/departments/1').send({ name: 'X' });
        expect(res.status).toBe(500);
    });
});

describe('DELETE /api/departments/:id', () => {
    it('deletes a department and returns result', async () => {
        const result = { affectedRows: 1 };
        db.query.mockImplementation((_q, _p, cb) => cb(null, result));

        const res = await request(app).delete('/api/departments/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(result);
    });

    it('passes id as an array to the query', async () => {
        db.query.mockImplementation((_q, params, cb) => cb(null, { affectedRows: 1 }));

        await request(app).delete('/api/departments/4');
        const params = db.query.mock.calls[0][1];
        expect(Array.isArray(params)).toBe(true);
        expect(params[0]).toBe('4');
    });

    it('returns 500 on database error', async () => {
        db.query.mockImplementation((_q, _p, cb) => cb(new Error('db error'), null));

        const res = await request(app).delete('/api/departments/1');
        expect(res.status).toBe(500);
    });
});
