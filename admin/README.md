# 🏠 Sensay Admin Panel

Administrative panel for managing users, replicas and files in the Sensay system.

## ✨ Features

- **Dashboard**: System overview with statistics
- **Users**: Create, view and manage B2B users
- **Replicas**: Create and manage AI replicas
- **Files**: Upload, view and manage training files

## 🚀 Technologies

- **Vite** - Fast build tool
- **React 18** - UI library
- **Pure CSS** - Custom styling
- **Responsive** - Works on desktop and mobile

## 📁 Project Structure

```
src/
├── components/
│   ├── Header/           # Header with navigation
│   │   ├── Header.jsx
│   │   └── Header.css
│   ├── Dashboard/        # Main dashboard
│   │   ├── Dashboard.jsx
│   │   └── Dashboard.css
│   ├── Users/            # User management
│   │   ├── Users.jsx
│   │   └── Users.css
│   ├── Replicas/         # Replica management
│   │   ├── Replicas.jsx
│   │   └── Replicas.css
│   ├── Files/            # File management
│   │   ├── Files.jsx
│   │   └── Files.css
│   └── Modal/            # Reusable modal component
│       ├── Modal.jsx
│       └── Modal.css
├── services/
│   └── api.js            # API integration service
├── utils/                 # Utility functions
├── App.jsx               # Main component
├── App.css               # Global styles
└── main.jsx              # Entry point
```

## 📦 Installation

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SENSAY_API_URL=https://api.sensay.io/v1
VITE_SENSAY_API_KEY=your-sensay-api-key-here
```

### Backend Integration

The admin panel integrates with the backend through these routes:

- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/replicas` - List replicas
- `POST /api/replicas` - Create replica
- `GET /api/files` - List files
- `POST /api/files/upload` - Upload file

## 🔌 API Service

The `src/services/api.js` file provides:

- **usersAPI**: User CRUD operations
- **replicasAPI**: Replica CRUD operations
- **filesAPI**: File management operations
- **sensayAPI**: Direct Sensay API integration
- **dashboardAPI**: Dashboard statistics

### Example Usage

```javascript
import { usersAPI, sensayAPI } from '../services/api'

// Create user in backend
const user = await usersAPI.create({
  id: 'user123',
  name: 'Company Name',
  email: 'admin@company.com'
})

// Create replica in Sensay
const replica = await sensayAPI.createReplica({
  name: 'Property Assistant',
  ownerID: 'user123'
})
```

## 📱 Responsiveness

The panel is fully responsive and works on:

- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (< 768px)

## 🎯 Next Steps

- [ ] Implement authentication and authorization
- [ ] Add edit functionality
- [ ] Implement search and filters
- [ ] Add pagination to tables
- [ ] Implement real-time notifications
- [ ] Add audit logs

## 🐛 Troubleshooting

### Problem: "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Problem: Port already in use
```bash
# Use different port
npm run dev -- --port 3002
```

## 📄 License

This project is part of the Sensay system and is under the same license.

## 🤝 Contributing

To contribute to the project:

1. Fork the repository
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Developed with ❤️ for the Sensay system**
