import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import bcrypt from 'bcrypt';
import app from '../src/app';
import { pool, query } from '../src/db';
import { generateToken } from '../src/middleware/auth';

const email = `recipes-test-${Date.now()}@example.com`;
const otherEmail = `recipes-test-other-${Date.now()}@example.com`;
let userId: string;
let otherUserId: string;
let token: string;
let otherToken: string;

const recipePayload = {
    name: 'Tomato Pasta',
    category: 'Dinner',
    description: 'Quick family meal',
    ingredients: ['pasta', 'tomatoes'],
    instructions: ['Boil pasta', 'Add tomatoes'],
    prep_time: 10,
    cook_time: 20,
    servings: 4,
    difficulty: 'Easy',
    tags: ['quick', 'family'],
};

describe('recipes API', () => {
    beforeAll(async () => {
        const passwordHash = await bcrypt.hash('RecipesTest123!', 4);
        const users = await query(
            `INSERT INTO users (email, password_hash, name)
             VALUES ($1, $2, $3), ($4, $2, $5)
             RETURNING id, email`,
            [email, passwordHash, 'Recipes Test User', otherEmail, 'Recipes Other User']
        );

        userId = users.rows.find((user) => user.email === email).id;
        otherUserId = users.rows.find((user) => user.email === otherEmail).id;
        token = generateToken(userId);
        otherToken = generateToken(otherUserId);
    });

    afterAll(async () => {
        await query('DELETE FROM recipes WHERE user_id IN ($1, $2)', [userId, otherUserId]);
        await query('DELETE FROM users WHERE id IN ($1, $2)', [userId, otherUserId]);
        await pool.end();
    });

    describe('GET /api/recipes', () => {
        it('requires authentication', async () => {
            const response = await request(app).get('/api/recipes');

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ success: false, error: 'No token provided' });
        });

        it('lists only the authenticated user recipes with filters', async () => {
            await request(app)
                .post('/api/recipes')
                .set('Authorization', `Bearer ${token}`)
                .send(recipePayload);

            const response = await request(app)
                .get('/api/recipes?page=1&pageSize=10&search=Tomato&difficulty=Easy&duration=under30')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.pagination).toMatchObject({ total: 1, page: 1, pageSize: 10 });
            expect(response.body.data[0].user_id).toBe(userId);

            const otherResponse = await request(app)
                .get('/api/recipes')
                .set('Authorization', `Bearer ${otherToken}`);
            expect(otherResponse.body.pagination.total).toBe(0);
        });
    });

    describe('POST /api/recipes', () => {
        it('rejects incomplete payloads', async () => {
            const response = await request(app)
                .post('/api/recipes')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Incomplete', category: 'Dinner' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('creates a recipe and normalizes array fields', async () => {
            const response = await request(app)
                .post('/api/recipes')
                .set('Authorization', `Bearer ${token}`)
                .send(recipePayload);

            expect(response.status).toBe(200);
            expect(response.body.data).toMatchObject({
                name: recipePayload.name,
                ingredients: recipePayload.ingredients,
                instructions: recipePayload.instructions,
                tags: recipePayload.tags,
            });
        });
    });

    describe('GET /api/recipes/:id', () => {
        it('returns a recipe and enforces user isolation', async () => {
            const createResponse = await request(app)
                .post('/api/recipes')
                .set('Authorization', `Bearer ${otherToken}`)
                .send({ ...recipePayload, name: 'Private Recipe' });
            const id = createResponse.body.data.id;

            const ownerResponse = await request(app)
                .get(`/api/recipes/${id}`)
                .set('Authorization', `Bearer ${otherToken}`);
            expect(ownerResponse.status).toBe(200);

            const otherResponse = await request(app)
                .get(`/api/recipes/${id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(otherResponse.status).toBe(404);
        });
    });

    describe('PUT /api/recipes/:id', () => {
        it('updates a recipe and rejects invalid numeric values', async () => {
            const createResponse = await request(app)
                .post('/api/recipes')
                .set('Authorization', `Bearer ${token}`)
                .send({ ...recipePayload, name: 'Recipe To Update' });
            const id = createResponse.body.data.id;

            const response = await request(app)
                .put(`/api/recipes/${id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Recipe', prep_time: 5, tags: ['updated'] });
            expect(response.status).toBe(200);
            expect(response.body.data).toMatchObject({ name: 'Updated Recipe', prep_time: 5, tags: ['updated'] });

            const invalidResponse = await request(app)
                .put(`/api/recipes/${id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ prep_time: 'not-a-number' });
            expect(invalidResponse.status).toBe(400);
        });
    });

    describe('DELETE /api/recipes/:id', () => {
        it('deletes a recipe and returns 404 afterward', async () => {
            const createResponse = await request(app)
                .post('/api/recipes')
                .set('Authorization', `Bearer ${token}`)
                .send({ ...recipePayload, name: 'Recipe To Delete' });
            const id = createResponse.body.data.id;

            const deleteResponse = await request(app)
                .delete(`/api/recipes/${id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(deleteResponse.status).toBe(200);

            const missingResponse = await request(app)
                .get(`/api/recipes/${id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(missingResponse.status).toBe(404);
        });
    });
});
