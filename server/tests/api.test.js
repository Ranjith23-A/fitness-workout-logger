import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../server.js';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Goal from '../models/Goal.js';

describe('4. Full-Stack Backend API Integration Tests', () => {
  let user1Token = null;
  let user1Id = null;
  let user2Token = null;
  let user2Id = null;
  let cardioWorkoutId = null;
  let strengthWorkoutId = null;

  before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.USE_MEMORY_DB = 'true';
    await connectDB();
    await User.deleteMany({});
    await Workout.deleteMany({});
    await Goal.deleteMany({});
  });

  after(async () => {
    await disconnectDB();
    setTimeout(() => process.exit(0), 200).unref();
  });

  test('POST /api/auth/register - Rejects invalid password or missing fields', async () => {
    // Missing fields
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' });
    assert.strictEqual(res1.status, 400);

    // Password lacking special character
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123'
      });
    assert.strictEqual(res2.status, 400);
  });

  test('POST /api/auth/register - Registers user with valid password (e.g. Ranjith@2026)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ranjith Kumar',
        email: 'ranjith@example.com',
        password: 'Ranjith@2026',
        confirmPassword: 'Ranjith@2026',
        age: 28,
        sex: 'male',
        height: 178,
        currentWeight: 76,
        targetWeight: 72,
        activityLevel: 'moderately_active',
        fitnessGoal: 'weight_loss'
      });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, 'ranjith@example.com');
    user1Token = res.body.token;
    user1Id = res.body.user.id;
  });

  test('POST /api/auth/register - Rejects duplicate email registration with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ranjith Duplicate',
        email: 'ranjith@example.com',
        password: 'Ranjith@2026'
      });

    assert.strictEqual(res.status, 409);
    assert.ok(res.body.message.includes('already exists'));
  });

  test('POST /api/auth/login - Validates login credentials', async () => {
    // Bad password
    const badPass = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'ranjith@example.com',
        password: 'WrongPassword@123'
      });
    assert.strictEqual(badPass.status, 401);

    // Correct password
    const success = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'ranjith@example.com',
        password: 'Ranjith@2026'
      });
    assert.strictEqual(success.status, 200);
    assert.ok(success.body.token);
  });

  test('Register second user for tenant isolation verification', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'Alice@Secure2026',
        currentWeight: 62,
        height: 165
      });

    assert.strictEqual(res.status, 201);
    user2Token = res.body.token;
    user2Id = res.body.user.id;
  });

  test('GET /api/auth/me - Protected route access', async () => {
    // Unauthorized without token
    const unauth = await request(app).get('/api/auth/me');
    assert.strictEqual(unauth.status, 401);

    // Authorized
    const auth = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${user1Token}`);
    assert.strictEqual(auth.status, 200);
    assert.strictEqual(auth.body.user.email, 'ranjith@example.com');
    assert.ok(auth.body.metrics.bmi > 0);
    assert.ok(auth.body.metrics.bmr > 0);
  });

  test('POST /api/workouts - Creates Cardio workout with server-calculated calories', async () => {
    const res = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'cardio',
        activityName: 'Morning Park Run',
        activityCategory: 'running',
        durationMinutes: 30,
        distanceKm: 5.2,
        intensity: 'moderate',
        notes: 'Felt great, brisk morning breeze'
      });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.workout._id);
    assert.strictEqual(res.body.workout.type, 'cardio');
    assert.ok(res.body.workout.calories.grossCalories > 0);
    assert.ok(res.body.workout.calories.met >= 9.0); // running moderate MET
    assert.strictEqual(res.body.workout.calories.weightSnapshotKg, 76);
    cardioWorkoutId = res.body.workout._id;
  });

  test('POST /api/workouts - Creates Strength workout with exercise volume calculation', async () => {
    const res = await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'strength',
        workoutName: 'Chest and Triceps Power',
        durationMinutes: 45,
        intensity: 'moderate',
        notes: 'Focused on progressive overload',
        exercises: [
          {
            exerciseName: 'Barbell Bench Press',
            muscleGroup: 'Chest',
            restTimeSeconds: 90,
            effortRpe: 8,
            sets: [
              { setNumber: 1, reps: 10, weightKg: 60 },
              { setNumber: 2, reps: 8, weightKg: 70 },
              { setNumber: 3, reps: 6, weightKg: 80 }
            ]
          },
          {
            exerciseName: 'Push Ups',
            muscleGroup: 'Chest',
            isBodyweight: true,
            sets: [
              { setNumber: 1, reps: 20, weightKg: 0, isBodyweight: true }
            ]
          }
        ]
      });

    assert.strictEqual(res.status, 201);
    const w = res.body.workout;
    assert.strictEqual(w.type, 'strength');
    // Volume: (10*60) + (8*70) + (6*80) = 600 + 560 + 480 = 1640 kg
    assert.strictEqual(w.totalVolumeKg, 1640);
    assert.ok(w.calories.grossCalories > 0);
    strengthWorkoutId = w._id;
  });

  test('User Data Isolation - User 2 cannot access or mutate User 1 workout', async () => {
    // User 2 tries to GET User 1 workout
    const getRes = await request(app)
      .get(`/api/workouts/${cardioWorkoutId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    assert.strictEqual(getRes.status, 403);

    // User 2 tries to DELETE User 1 workout
    const delRes = await request(app)
      .delete(`/api/workouts/${cardioWorkoutId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    assert.strictEqual(delRes.status, 403);

    // User 2 querying all workouts returns only 0 workouts
    const listRes = await request(app)
      .get('/api/workouts')
      .set('Authorization', `Bearer ${user2Token}`);
    assert.strictEqual(listRes.body.total, 0);
    assert.strictEqual(listRes.body.workouts.length, 0);
  });

  test('GET /api/workouts - Filters by type, search, and sorting', async () => {
    // Filter type = cardio
    const cardioOnly = await request(app)
      .get('/api/workouts?type=cardio')
      .set('Authorization', `Bearer ${user1Token}`);
    assert.strictEqual(cardioOnly.status, 200);
    assert.strictEqual(cardioOnly.body.workouts.length, 1);
    assert.strictEqual(cardioOnly.body.workouts[0].type, 'cardio');

    // Filter type = strength
    const strengthOnly = await request(app)
      .get('/api/workouts?type=strength')
      .set('Authorization', `Bearer ${user1Token}`);
    assert.strictEqual(strengthOnly.status, 200);
    assert.strictEqual(strengthOnly.body.workouts.length, 1);
    assert.strictEqual(strengthOnly.body.workouts[0].type, 'strength');

    // Search query matches
    const searchRes = await request(app)
      .get('/api/workouts?search=Bench')
      .set('Authorization', `Bearer ${user1Token}`);
    assert.strictEqual(searchRes.body.workouts.length, 1);
    assert.strictEqual(searchRes.body.workouts[0].type, 'strength');
  });

  test('PUT /api/workouts/:id - Updates workout with recalculations', async () => {
    const updateRes = await request(app)
      .put(`/api/workouts/${cardioWorkoutId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'cardio',
        durationMinutes: 45, // increased from 30
        distanceKm: 7.5,
        activityCategory: 'running',
        intensity: 'moderate'
      });

    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.workout.durationMinutes, 45);
    // Calories must have automatically increased with longer duration
    assert.ok(updateRes.body.workout.calories.grossCalories > 400);
  });

  test('GET /api/stats/dashboard - Generates calculated statistics', async () => {
    const res = await request(app)
      .get('/api/stats/dashboard')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(res.status, 200);
    const { stats } = res.body;
    assert.strictEqual(stats.today.count, 2);
    assert.ok(stats.today.durationMinutes >= 75);
    assert.ok(stats.today.calories > 0);
    assert.strictEqual(stats.streak, 1);
    assert.strictEqual(stats.charts.typeDistribution[0].count, 1); // 1 cardio
    assert.strictEqual(stats.charts.typeDistribution[1].count, 1); // 1 strength
  });

  test('GET /api/stats/records - Accurately computes Personal Records (PRs)', async () => {
    const res = await request(app)
      .get('/api/stats/records')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(res.status, 200);
    const { records } = res.body;
    assert.strictEqual(records.exercisePRs[0].exerciseName, 'Barbell Bench Press');
    assert.strictEqual(records.exercisePRs[0].maxWeightKg, 80);
    assert.strictEqual(records.maxCardioDistance.value, 7.5);
  });

  test('POST /api/profile/weight - Records historical weight and updates metrics', async () => {
    const res = await request(app)
      .post('/api/profile/weight')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        weight: 75.2,
        note: 'Mid-week weigh-in'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.metrics.weightKg, 75.2);
    assert.strictEqual(res.body.weightHistory.length, 2);
  });

  test('DELETE /api/workouts/:id - Deletes workout', async () => {
    const res = await request(app)
      .delete(`/api/workouts/${cardioWorkoutId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.strictEqual(res.status, 200);

    // Verify it is gone
    const check = await request(app)
      .get(`/api/workouts/${cardioWorkoutId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    assert.strictEqual(check.status, 404);
  });
});
