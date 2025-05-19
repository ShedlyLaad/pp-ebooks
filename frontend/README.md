# BiblioF Frontend

This is the frontend application for BiblioF, a book management system that allows users to browse, order, and rent books. It includes separate interfaces for users, authors, and administrators.

## Features

- User Authentication (Login/Register)
- Role-based access control (Admin, Author, User)
- Book browsing and searching
- Book ordering and rental system
- Author book management
- Admin dashboard with statistics
- User profile management
- Order and rental tracking

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend API running (typically on http://localhost:8001)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Create a `.env` file in the root directory with:
   ```
   REACT_APP_API_URL=http://localhost:8001/api
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3000

## Project Structure

```
src/
├── api/              # API configuration and axios setup
├── auth/             # Authentication context and protected routes
├── components/       # Reusable components
├── layouts/          # Page layouts (Admin, Auth)
├── pages/           
│   ├── admin/       # Admin-specific pages
│   ├── author/      # Author-specific pages
│   ├── common/      # Shared pages (Login, Register)
│   └── user/        # User-specific pages
├── services/        # API service functions
└── routes.js        # Route configurations
```

## Available Scripts

- `npm start`: Run development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

## Role-Based Access

### Admin
- View dashboard statistics
- Manage all books
- Manage users
- Monitor orders and rentals

### Author
- Manage own books
- View book statistics
- Update book information

### User
- Browse and search books
- Place orders
- Rent books
- Track orders and rentals

## Technologies Used

- React.js
- Material-UI (MUI)
- React Router
- Formik & Yup
- Axios
- React-Toastify
- JWT Authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
