# Routeify Backend

## User Endpoints Documentation

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

#### Response (Status Code: 201)

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
      "msg": "First name must be at least 3 characters long",
      "param": "fullname",
      "location": "body"
    },
    {
      "msg": "Password must be at least 6 characters long",
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
      "msg": "Password must be at least 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

### Get User Profile

#### GET /users/profile

This endpoint is used to retrieve the profile of the authenticated user.

#### Headers

- `Authorization` (string, required): The JWT token of the authenticated user.

#### Response (Status Code: 200)

The response will be a JSON object containing the user's profile information.

Example:
```json
{
  "user": {
    "id": "user_id",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com"
  }
}
```

#### Error Response (Status Code: 401)

The error response will be a JSON object containing the following field:

- `message` (string): The error message.

Example:
```json
{
  "message": "Unauthorized"
}
```

### Logout User

#### GET /users/logout

This endpoint is used to log out the authenticated user.

#### Headers

- `Authorization` (string, required): The JWT token of the authenticated user.

#### Response (Status Code: 200)

The response will be a JSON object containing the following field:

- `message` (string): A message indicating the user has been logged out.

Example:
```json
{
  "message": "Logged out"
}
```

#### Error Response (Status Code: 401)

The error response will be a JSON object containing the following field:

- `message` (string): The error message.

Example:
```json
{
  "message": "Unauthorized"
}
```

## Captain Endpoints Documentation

### Register Captain

#### POST /captains/register

This endpoint is used to register a new captain.

#### Request Body

The request body should be a JSON object with the following fields:

- `fullname`: An object containing:
  - `firstname` (string, required): The first name of the captain. Must be at least 3 characters long.
  - `lastname` (string, optional): The last name of the captain. Must be at least 3 characters long.
- `email` (string, required): The email address of the captain. Must be a valid email format.
- `password` (string, required): The password for the captain's account. Must be at least 6 characters long.
- `vehicle`: An object containing:
  - `color` (string, required): The color of the vehicle. Must be at least 3 characters long.
  - `plate` (string, required): The plate number of the vehicle. Must be at least 3 characters long.
  - `capacity` (number, required): The capacity of the vehicle. Must be at least 1.
  - `vehicleType` (string, required): The type of the vehicle. Must be one of 'car', 'motorcycle', or 'auto'.

Example:
```json
{
  "fullname": {
    "firstname": "Jane",
    "lastname": "Smith"
  },
  "email": "jane.smith@example.com",
  "password": "securepassword",
  "vehicle": {
    "color": "Red",
    "plate": "XYZ123",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```
#### Response (Status Code: 201)

The response will be a JSON object containing the following field:

- `token` (string): The JWT token for the authenticated captain.

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
      "msg": "First name must be at least 3 characters long",
      "param": "fullname",
      "location": "body"
    },
    {
      "msg": "Password must be at least 6 characters long",
      "param": "password",
      "location": "body"
    },
    {
      "msg": "Vehicle color must be at least 3 characters long",
      "param": "vehicle.color",
      "location": "body"
    },
    {
      "msg": "Vehicle plate must be at least 3 characters long",
      "param": "vehicle.plate",
      "location": "body"
    },
    {
      "msg": "Vehicle capacity must be at least 1",
      "param": "vehicle.capacity",
      "location": "body"
    },
    {
      "msg": "Vehicle type must be one of 'car', 'motorcycle', or 'auto'",
      "param": "vehicle.vehicleType",
      "location": "body"
    }
  ]
}
```
### Login Captain

#### POST /captains/login

This endpoint is used to authenticate an existing captain.

#### Request Body

The request body should be a JSON object with the following fields:

- `email` (string, required): The email address of the captain. Must be a valid email.
- `password` (string, required): The password for the captain's account. Must be at least 6 characters long.

Example:
```json
{
  "email": "jane.smith@example.com",
  "password": "securepassword"
}
```

#### Response (Status Code: 200)

The response will be a JSON object containing the following field:

- `token` (string): The JWT token for the authenticated captain.

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
      "msg": "Password must be at least 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

### Get Captain Profile

#### GET /captains/profile

This endpoint is used to retrieve the profile of the authenticated captain.

#### Headers

- `Authorization` (string, required): The JWT token of the authenticated captain.

#### Response (Status Code: 200)

The response will be a JSON object containing the captain's profile information.

Example:
```json
{
  "captain": {
    "id": "captain_id",
    "firstname": "Jane",
    "lastname": "Smith",
    "email": "jane.smith@example.com",
    "vehicle": {
      "color": "Red",
      "plate": "XYZ123",
      "capacity": 4,
      "vehicleType": "car"
    }
  }
}
```

#### Error Response (Status Code: 401)

The error response will be a JSON object containing the following field:

- `message` (string): The error message.

Example:
```json
{
  "message": "Unauthorized"
}
```

### Logout Captain

#### GET /captains/logout

This endpoint is used to log out the authenticated captain.

#### Headers

- `Authorization` (string, required): The JWT token of the authenticated captain.

#### Response (Status Code: 200)

The response will be a JSON object containing the following field:

- `message` (string): A message indicating the captain has been logged out.

Example:
```json
{
  "message": "Logged out"
}
```

#### Error Response (Status Code: 401)

The error response will be a JSON object containing the following field:

- `message` (string): The error message.

Example:
```json
{
  "message": "Unauthorized"
}
```