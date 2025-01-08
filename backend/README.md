# Routeify Backend

## API Endpoints

### Register User

#### POST /users/register

This endpoint is used to register a new user.

#### Request Body

The request body should be a JSON object with the following fields:

- `fullname`: An object containing:
  - `firstname` (string, required): The first name of the user. Must be at least 3 characters long.
  - `lastname` (string, optional): The last name of the user. Must be at least 3 characters long.
- `email` (string, required): The email address of the user. Must be a valid email and at least 5 characters long.
- `password` (string, required): The password for the user. Must be at least 6 characters long.

Example:
```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "password123"
}
```

#### Response (Staus Code : 201)

The response will be a JSON object containing the following field:

- `token` (string): The JWT token for the authenticated user.

Example:
```json
{
  "token": "your_jwt_token_here"
}
```

#### Error Response (Status Code : 400)

The error response will be a JSON object containing the following field:

- `errors` (array): An array of error objects.

Example:
```json
{
  "errors": [
    {
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "First name must be at least 3 characters long",
      "param": "fullname",
      "location": "body"
    },
    {
      "msg": "Password must be atleast 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```
### Login User

#### POST /users/login

This endpoint is used to authenticate an existing user.

#### Request Body

The request body should be a JSON object with the following fields:

- `email` (string, required): The email address of the user. Must be a valid email.
- `password` (string, required): The password for the user. Must be at least 6 characters long.

Example:
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

#### Response (Status Code: 200)

The response will be a JSON object containing the following field:

- `token` (string): The JWT token for the authenticated user.

Example:
```json
{
  "token": "your_jwt_token_here"
}
```

#### Error Response (Status Code: 400)

The error response will be a JSON object containing the following field:

- `errors` (array): An array of error objects.

Example:
```json
{
  "errors": [
    {
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    },
    {
      "msg": "Password must be atleast 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```