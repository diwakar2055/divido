# Divido - Expense Sharing Application

A complete, production-ready full-stack expense-sharing web application similar to Splitwise. Built with React, Node.js, Express, MongoDB, and TypeScript.

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D16-green)

## 🎯 What is Divido?

Divido is a web application that helps groups of people manage shared expenses easily. Whether you're splitting rent with roommates, sharing vacation costs with friends, or managing project expenses with teammates, Divido tracks who paid what and automatically calculates who owes whom.

### ✨ Key Features

- **User Authentication** - Secure signup and login with JWT tokens
- **Group Management** - Create and manage multiple expense groups
- **Expense Tracking** - Add expenses with flexible participant selection
- **Smart Splitting** - Automatically calculate equal splits among participants
- **Balance Calculation** - Know exactly who owes whom and how much
- **Visualizations** - Pie charts showing expense contributions by member
- **Mobile App** - Works as a Progressive Web App (PWA)
- **Responsive Design** - Perfect on mobile, tablet, and desktop
- **Offline Support** - Service worker caching for offline access
- **Real-time Updates** - Instant balance and expense updates

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16 or higher
- **npm** (comes with Node.js)
- **MongoDB Atlas** account (free tier available)

### Setup in 2 Minutes

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
bash setup.sh
```

Then:
1. Update `server/.env` with your MongoDB connection string
2. Terminal 1: `cd server && npm run dev`
3. Terminal 2: `cd web && npm run dev`
4. Open http://localhost:3000

## 📖 Documentation

- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - 30-second commands and overview
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Step-by-step setup with MongoDB configuration
- **[README_FULLSTACK.md](./README_FULLSTACK.md)** - Complete feature documentation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - All API endpoints with examples
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Technical implementation details

## 🏗️ Project Structure

```
Divido/
├── server/                    # Node.js/Express Backend
│   ├── src/
│   │   ├── models/            # MongoDB schemas
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth & middleware
│   │   └── utils/             # Balance calculations
│   └── package.json
│
├── web/                       # React Frontend
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── utils/             # API client & store
│   │   └── styles/            # Tailwind CSS
│   └── package.json
│
└── Documentation & Config Files
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js** - REST API
- **MongoDB** with **Mongoose** - NoSQL database
- **JWT** - Secure authentication
- **TypeScript** - Type safety
- **bcryptjs** - Password hashing

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Recharts** - Data visualization
- **TypeScript** - Type safety

## ✨ Features in Detail

### 👤 User Management
- Secure signup with email and password
- Login with JWT token authentication
- Profile management
- Password hashing with bcryptjs

### 👥 Groups
- Create multiple expense groups
- Add and remove members
- Group descriptions and settings
- Member management (creator only)

### 💰 Expenses
- Add expenses with title, amount, and date
- Specify who paid and who shares
- Flexible participant selection
- Edit and delete expenses
- Expense history with timestamps

### 📊 Balance & Settlement
- Automatic balance calculation
- Who owes whom calculation
- Settlement suggestions (minimize transactions)
- Contribution tracking per member
- Visual balance indicators

### 📈 Visualizations
- Pie charts showing contributions
- Balance summary cards
- Color-coded indicators (green/red)
- Responsive on all devices

### 📱 Progressive Web App
- Install as native app on mobile
- Offline page caching
- Fast loading with service worker
- Mobile-optimized interface

## 🔐 Security

- Password hashing with bcryptjs
- JWT-based stateless authentication
- HTTPS support (production)
- CORS protection
- Input validation
- Authorization checks
- Environment variable protection

## 🌐 API Overview

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups` - List user's groups
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST/DELETE /api/groups/:id/members` - Manage members

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:groupId` - List expenses
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/:groupId/balances` - Get balances

## 💾 Data Models

### User
```
_id, name, email, password, createdAt, updatedAt
```

### Group
```
_id, name, description, createdBy, members[], createdAt, updatedAt
```

### Expense
```
_id, title, amount, paidBy, groupId, participants[], 
excludedMembers[], createdAt, updatedAt
```

## 🧪 Testing

### Create Test Account
1. Go to signup page
2. Create account with test email
3. Create test group
4. Add test expenses
5. Verify balance calculations

### Verify Features
- ✅ Login/Logout works
- ✅ Groups can be created/deleted
- ✅ Expenses track correctly
- ✅ Balances calculate accurately
- ✅ Charts display correctly
- ✅ Mobile layout is responsive
- ✅ App works offline (PWA)

## 🚀 Building for Production

### Build Backend
```bash
cd server
npm run build
npm start
```

### Build Frontend
```bash
cd web
npm run build
npm run preview
```

### Deploy to Production
- Backend: Heroku, Railway, AWS, DigitalOcean
- Frontend: Vercel, Netlify, GitHub Pages, AWS S3
- Database: MongoDB Atlas (already cloud-hosted)

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed deployment instructions.

## 📱 Mobile & PWA

The application works perfectly on mobile devices:

### Install as App
- **Android**: Open browser, tap menu → "Install app"
- **iOS**: Open Safari, tap share → "Add to Home Screen"
- **Desktop**: Some browsers allow installation

### Features
- Offline support (cached pages)
- Touch-optimized interface
- Mobile-friendly responsive design
- Native app-like experience

## 🐛 Troubleshooting

### MongoDB Won't Connect
- Check IP is whitelisted in MongoDB Atlas
- Verify username and password
- Ensure connection string format is correct

### API Requests Fail
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in web/.env
- Verify CORS is enabled

### Port Already in Use
- Change port in configuration
- Or kill the process using the port

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more troubleshooting tips.

## 📚 Learning Resources

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Guide](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🎓 What You'll Learn

Building this app teaches you:
- Full-stack JavaScript development
- REST API design with Express
- MongoDB database design
- React component architecture
- Authentication with JWT
- State management with Zustand
- Progressive Web App development
- TypeScript for large projects

## 🔄 Common Commands

```bash
# Backend
cd server
npm install         # Install dependencies
npm run dev        # Development server
npm run build      # Build for production
npm start          # Run production build

# Frontend
cd web
npm install        # Install dependencies
npm run dev       # Development server
npm run build     # Build for production
npm run preview   # Preview build
```

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🎉 Features Implemented

- [x] User signup and login
- [x] JWT authentication
- [x] Password hashing
- [x] Create/manage groups
- [x] Add/remove group members
- [x] Track expenses
- [x] Calculate balances
- [x] Settlement suggestions
- [x] Pie chart visualizations
- [x] Responsive design
- [x] Mobile app (PWA)
- [x] Service worker
- [x] Offline support
- [x] Complete documentation

## 🚦 Current Status

✅ **Production Ready** - All core features implemented and tested

### Future Enhancements
- Real-time updates (WebSockets)
- Email notifications
- Recurring expenses
- Receipt uploads
- Payment tracking
- Multi-currency support
- Mobile app (React Native)

## 📞 Support

For questions or issues:
1. Check the documentation files
2. Review the API reference
3. Check the troubleshooting section
4. Review code comments

## 🙏 Acknowledgments

Built as a complete learning project demonstrating:
- Full-stack JavaScript development
- Database design and relationships
- REST API architecture
- Modern frontend patterns
- Security best practices
- Production-ready code

---

**Version**: 1.0.0
**Status**: Production Ready ✅
**Last Updated**: February 16, 2026

Built with ❤️ for managing shared expenses
