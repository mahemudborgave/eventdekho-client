# 🎉 EventApply

> **Discover, Connect, and Participate in College Events Across India**

EventApply is a comprehensive platform that bridges the gap between colleges and students by providing a centralized hub for discovering, managing, and participating in college events. Whether you're a student looking for exciting opportunities or a college administrator managing events, EventApply has got you covered.

![EventApply Banner](https://img.shields.io/badge/EventApply-Platform-blue?style=for-the-badge&logo=calendar)
![Status](https://img.shields.io/badge/Status-Active-green?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-orange?style=for-the-badge)

## 🌟 Features

### 🎯 For Students
- **🔍 Smart Event Discovery**: Search and filter events by college, location, date, and event type
- **📱 User-Friendly Interface**: Modern, responsive design that works on all devices
- **👤 Student Profiles**: Create and manage your profile with participation history
- **📋 Event Registration**: Easy one-click registration for events
- **📊 Participation Tracking**: View all your registered events and participation status
- **🔔 Real-time Updates**: Stay informed about event changes and deadlines
- **📱 Mobile Responsive**: Access events on-the-go with mobile-optimized interface

### 🏫 For Colleges & Administrators
- **🎪 Event Management**: Create, edit, and manage events with comprehensive details
- **📊 Registration Analytics**: Track event registrations and participant data
- **🏢 College Registration**: Register your college and start posting events
- **📈 Dashboard Analytics**: Monitor event performance and engagement metrics
- **📋 Participant Management**: View and manage event registrations
- **📅 Event Scheduling**: Set event dates, deadlines, and registration periods
- **🏷️ Event Categorization**: Tag events for better discoverability

### 🌐 Platform Features
- **🔐 Secure Authentication**: JWT-based authentication system
- **📊 Data Export**: Export event data and registrations to PDF/Excel
- **🎨 Modern UI/UX**: Beautiful interface with smooth animations
- **⚡ Fast Performance**: Optimized for speed and efficiency
- **🔍 Advanced Search**: Filter events by multiple criteria
- **📱 Progressive Web App**: Works offline and provides app-like experience

## 🚀 Upcoming Features

### 🔮 Phase 2 Development
- **🎥 Live Streaming Integration**: Support for online event streaming
- **💬 Event Chat System**: Real-time communication between participants
- **📸 Photo Gallery**: Share event photos and memories
- **⭐ Rating & Reviews**: Rate events and provide feedback
- **🎫 QR Code Tickets**: Digital tickets with QR code scanning
- **📱 Push Notifications**: Instant notifications for event updates
- **🌍 Multi-language Support**: Support for multiple Indian languages
- **📊 Advanced Analytics**: Detailed insights and reporting tools

### 🔮 Phase 3 Development
- **🤖 AI-Powered Recommendations**: Smart event suggestions based on interests
- **🎯 Personalized Dashboard**: Customized experience for each user
- **📈 Social Features**: Share events on social media platforms
- **🎨 Event Templates**: Pre-designed templates for common event types
- **🔗 API Integration**: Third-party integrations for enhanced functionality
- **📱 Mobile App**: Native iOS and Android applications

## 🛠️ Tech Stack

### Frontend (Client)
![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.2.0-purple?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.3-38B2AC?logo=tailwind-css)
![Flowbite React](https://img.shields.io/badge/Flowbite_React-0.11.7-cyan?logo=flowbite)

Repo - https://github.com/mahemudborgave/eventdekho-client

**Key Libraries:**
- **UI Components**: Material-UI, Flowbite React, Lucide React Icons
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Charts**: Recharts
- **File Handling**: jsPDF, xlsx, file-saver
- **Animations**: React Simple Typewriter, React Fast Marquee
- **Notifications**: React Toastify
- **Loading**: React Spinners

### Backend (Server)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8.14.0-green?logo=mongodb)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?logo=json-web-tokens)


Repo - https://github.com/mahemudborgave/eventdekho-server

**Key Technologies:**
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing
- **CORS**: Cross-origin resource sharing enabled
- **Environment**: dotenv for configuration management

### Development Tools
- **Package Manager**: Bun (with npm fallback)
- **Linting**: ESLint with React plugins
- **Build Tool**: Vite for fast development
- **Version Control**: Git
- **Deployment**: Vercel (Frontend)

## 📁 Project Structure

```
EventApply/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   │   ├── Dashboard/ # Admin dashboard pages
│   │   │   └── ...        # User-facing pages
│   │   ├── context/       # React context providers
│   │   ├── assets/        # Static assets (images, etc.)
│   │   └── ...
│   ├── public/            # Public assets
│   └── package.json       # Frontend dependencies
├── server/                # Backend Node.js Application
│   ├── routes/            # API route handlers
│   ├── models/            # MongoDB schemas
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   └── package.json       # Backend dependencies
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Bun (optional, npm works too)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/EventApply.git
   cd EventApply
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   # or
   bun install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../server
   npm install
   # or
   bun install
   ```

4. **Environment Setup**
   
   Create `.env` file in the server directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

5. **Start Development Servers**

   **Backend:**
   ```bash
   cd server
   npm start
   # or
   bun start
   ```

   **Frontend:**
   ```bash
   cd client
   npm run dev
   # or
   bun dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📊 Database Schema

### Core Models
- **User**: Student profiles and authentication
- **College**: College information and registration
- **Event**: Event details and metadata
- **EventRegistration**: Participant registrations

## 🔧 API Endpoints

### Authentication
- `POST /login/register` - User registration
- `POST /login/login` - User login
- `GET /userauth` - Verify authentication

### Events
- `GET /eventt` - Get all events
- `POST /eventt` - Create new event
- `PUT /eventt/:id` - Update event
- `DELETE /eventt/:id` - Delete event
- `POST /eventt/register` - Register for event

### Colleges
- `GET /college` - Get all colleges
- `POST /college` - Register new college

## 🎨 UI/UX Highlights

- **Modern Design**: Clean, intuitive interface with Material Design principles
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Engaging user experience with subtle animations
- **Accessibility**: WCAG compliant design for inclusive user experience
- **Dark/Light Mode**: Theme support (planned feature)
- **Loading States**: Proper loading indicators and skeleton screens

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Material-UI** for the beautiful component library
- **MongoDB** for the flexible database solution
- **Express.js** for the robust backend framework

## 📞 Support & Contact

- **Email**: mahemudborgave@gmail.com
- **Website**: https://EventApply1.vercel.app
- **Issues**: [GitHub Issues](https://github.com/mahemudborgave/EventApply-client/issues)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=mahemudborgave/EventApply-client&type=Date)](https://star-history.com/#mahemudborgave/EventApply-client&Date)

---

<div align="center">
  <p>Made with ❤️ by the EventApply Team</p>
  <p>Empowering students to discover amazing opportunities!</p>
</div>