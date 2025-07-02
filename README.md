# Routeify

Routeify is a scalable ride-sharing application that connects passengers with drivers offering rides in multiple vehicle types such as bikes, cars, and autos. Users can book rides in real time, while drivers (riders) can accept ride requests, manage trips, and track their earnings through an intuitive platform.

## Features

- **Multiple Vehicle Types:** Book rides using bike, car, or auto options.  
- **Driver Mode:** Switch roles to become a driver, manage bookings, and view earnings.  
- **Real-Time Tracking:** Live updates on driver and passenger locations with WebSocket-powered communication.  
- **Optimized Matching:** Uses MongoDB geospatial indexing to match drivers and passengers efficiently, supporting 800+ concurrent users with sub-second response times.  
- **Mobile-First Responsive UI:** Built with React.js, Redux, and TailwindCSS for seamless user experience across devices.  
- **Secure Payments:** Integrated Razorpay API for hassle-free and safe payment processing.

## Tech Stack

- **Frontend:** React.js, Redux, TailwindCSS  
- **Backend:** Node.js, Express.js, Socket.io  
- **Database:** MongoDB  
- **Payments:** Razorpay

## Getting Started

### Prerequisites

- Node.js and npm/yarn installed  
- MongoDB instance (local or cloud)  
- Razorpay account for payment integration

### Installation

1. Clone the repository:  
   ```
   git clone https://github.com/your-username/routeify.git
   cd frontend
   ```
2. Install Dependencies:
   ```
   npm install
   ```
3. Configure environment variables for MongoDB connection and Razorpay keys.
4. Start the development server:
   ```
   npm run dev
   ```

### Scalability & Performance
- Supports high concurrency with optimized WebSocket communication
- MongoDB geospatial queries ensure precise and fast driver-passenger matching
- Modular architecture for future extension (e.g., push notifications, surge pricing)

### Contibuting
I welcome contributions! To get started:

- Fork the repository
- Create your feature branch (git checkout -b feature-name)
- Commit your changes (git commit -m 'Add some feature')
- Push to the branch (git push origin feature-name)
- Create a Pull Request

### License
This project is licensed under the MIT License.
