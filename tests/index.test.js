const request = require('supertest');
const BACKEND_URL = 'http://localhost:4000';

// Helper function to generate a random email
const generateRandomEmail = () => {
    const timestamp = Date.now(); // Current timestamp to ensure uniqueness
    return `user${timestamp}@example.com`;
};

describe.skip('User Endpoints', () => {
    it('should register a new user', async () => {
        const email = generateRandomEmail(); // Generate a random email
        const res = await request(BACKEND_URL)
            .post('/users/register')
            .send({
                fullname: { firstname: 'John', lastname: 'Doe' },
                email, // Use random email
                password: 'password123'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
    });

    it('should not register a user with an existing email', async () => {
        const existingEmail = 'johndoe@example.com';
        const res = await request(BACKEND_URL)
            .post('/users/register')
            .send({
                fullname: { firstname: 'John', lastname: 'Doe' },
                email: existingEmail,
                password: 'password123'
            });
        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message', 'User already exists with this email');
    });

    it('should login an existing user', async () => {
        const res = await request(BACKEND_URL)
            .post('/users/login')
            .send({
                email: 'johndoe@example.com',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
    });

    it('should not login with incorrect password', async () => {
        const res = await request(BACKEND_URL)
            .post('/users/login')
            .send({
                email: 'johndoe@example.com',
                password: 'wrongpassword'
            });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Invalid Email or Password');
    });

    it('should get user profile', async () => {
        const loginRes = await request(BACKEND_URL)
            .post('/users/login')
            .send({
                email: 'johndoe@example.com',
                password: 'password123'
            });

        expect(loginRes.statusCode).toEqual(200);
        expect(loginRes.body).toHaveProperty('token');
        const token = loginRes.body.token;

        const res = await request(BACKEND_URL)
            .get('/users/profile')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('email', 'johndoe@example.com');
    });
    
    it('should logout user', async () => {
        const loginRes = await request(BACKEND_URL)
            .post('/users/login')
            .send({
                email: 'johndoe@example.com',
                password: 'password123'
            });

        expect(loginRes.statusCode).toEqual(200);
        expect(loginRes.body).toHaveProperty('token');
        const token = loginRes.body.token;

        const res = await request(BACKEND_URL)
            .get('/users/logout')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Logged out');
    });
})    

describe.skip('Captain Endpoints', () => {
    it('should register a new captain', async () => {
        const email = generateRandomEmail(); // Generate a random email
        const res = await request(BACKEND_URL)
            .post('/captains/register')
            .send({
                fullname: { firstname: 'Jane', lastname: 'Doe' },
                email, 
                password: 'password123',
                vehicle: {
                    color: 'Red',
                    plate: 'ABC123',
                    capacity: 4,
                    vehicleType: 'car'
                }
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('captain');
    });

    it('should not register a captain with an existing email', async () => {
        const existingEmail = 'janedoe@example.com';
        const res = await request(BACKEND_URL)
            .post('/captains/register')
            .send({
                fullname: { firstname: 'Jane', lastname: 'Doe' },
                email: existingEmail,
                password: 'password123',
                vehicle: {
                    color: 'Blue',
                    plate: 'XYZ789',
                    capacity: 2,
                    vehicleType: 'motorcycle'
                }
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Captain already exists.');
    });

    it('should login an existing captain', async () => {
        const res = await request(BACKEND_URL)
            .post('/captains/login')
            .send({
                email: 'janedoe@example.com',
                password: 'password123'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('captain');
    });

    it('should not login with incorrect password', async () => {
        const res = await request(BACKEND_URL)
            .post('/captains/login')
            .send({
                email: 'janedoe@example.com',
                password: 'wrongpassword'
            });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Invalid Email or Password');
    });

    it('should get captain profile', async () => {
        const loginRes = await request(BACKEND_URL)
            .post('/captains/login')
            .send({
                email: 'janedoe@example.com',
                password: 'password123'
            });
    
        expect(loginRes.statusCode).toEqual(200);
        expect(loginRes.body).toHaveProperty('token');
        const token = loginRes.body.token;
    
        const res = await request(BACKEND_URL)
            .get('/captains/profile')
            .set('Authorization', `Bearer ${token}`);
    
        expect(res.statusCode).toEqual(200);
        console.log(res.body);  // To see the full response
    
        // Checking if the response contains the captain property
        expect(res.body).toHaveProperty('captain');
    
        // Additional checks to verify the captain's information
        const { captain } = res.body;  // Destructure captain object
        expect(captain).toHaveProperty('fullname');
        expect(captain).toHaveProperty('vehicle');
        expect(captain.fullname).toEqual({ firstname: 'Jane', lastname: 'Doe' });
        expect(captain.vehicle).toEqual({
            color: 'Blue',
            plate: 'XYZ789',
            capacity: 2,
            vehicleType: 'motorcycle'
        });
        expect(captain).toHaveProperty('_id');
        expect(captain).toHaveProperty('email');
        expect(captain.status).toEqual('inactive');
    });    

    it('should logout captain', async () => {
        const loginRes = await request(BACKEND_URL)
            .post('/captains/login')
            .send({
                email: 'janedoe@example.com',
                password: 'password123'
            });

        expect(loginRes.statusCode).toEqual(200);
        expect(loginRes.body).toHaveProperty('token');
        const token = loginRes.body.token;

        const res = await request(BACKEND_URL)
            .get('/captains/logout')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Logged out');
    });
});