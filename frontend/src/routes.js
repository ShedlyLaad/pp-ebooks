import { Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

// Common Pages
import Login from './pages/common/Login';
import Register from './pages/common/Register';
import AboutUs from './pages/common/AboutUs';
import ContactUs from './pages/common/ContactUs';

// User Pages
import HomeUser from './pages/user/HomeUser';
import MyRentals from './pages/user/MyRentals';
import MyOrders from './pages/user/MyOrders';
import Profile from './pages/user/Profile';

// Admin Pages
import HomeAdmin from './pages/admin/HomeAdmin';
import ManageBooks from './pages/admin/ManageBooks';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOrders from './pages/admin/ManageOrders';
import ManageRentals from './pages/admin/ManageRentals';
import Stats from './pages/admin/Stats';

// Author Pages
import HomeAuthor from './pages/author/HomeAuthor';
import AddBook from './pages/author/AddBook';
import EditBook from './pages/author/EditBook';
import MyBooks from './pages/author/MyBooks';
import BrowseBooks from './pages/author/BrowseBooks';
import AuthorMyRentals from './pages/author/MyRentals';
import AuthorMyOrders from './pages/author/MyOrders';
const RouteConfig = () => {
    return [
        {
            path: '/',
            element: <AuthLayout />,
            children: [
                { path: 'login', element: <Login /> },
                { path: 'register', element: <Register /> },
                { path: 'about', element: <AboutUs /> },
                { path: 'contact', element: <ContactUs /> },
                { path: '', element: <Navigate to="/user/home" /> }
            ]
        },
        {            path: '/user',
            element: <UserLayout />,
            children: [
                { path: '', element: <HomeUser /> },
                { path: 'home', element: <HomeUser /> },
                { path: 'my-rentals', element: <MyRentals /> },
                { path: 'my-orders', element: <MyOrders /> },
                { path: 'profile', element: <Profile /> }
            ],
            roles: ['user', 'admin', 'author']
    },
    {        path: '/admin',
        element: <AdminLayout />,
        children: [
            { path: '', element: <HomeAdmin /> },
            { path: 'books', element: <ManageBooks /> },
            { path: 'users', element: <ManageUsers /> },
            { path: 'orders', element: <ManageOrders /> },
            { path: 'rentals', element: <ManageRentals /> },
            { path: 'stats', element: <Stats /> },
            { path: 'profile', element: <Profile /> }
        ],
        roles: ['admin']
    },
    {        path: '/author',
        element: <UserLayout />,
        children: [
            { path: '', element: <HomeAuthor /> },
            { path: 'browse', element: <BrowseBooks /> },
            { path: 'add-book', element: <AddBook /> },
            { path: 'edit-book/:id', element: <EditBook /> },
            { path: 'my-books', element: <MyBooks /> },
            { path: 'my-rentals', element: <AuthorMyRentals /> },
            { path: 'my-orders', element: <AuthorMyOrders /> },
            { path: 'profile', element: <Profile /> }
        ],roles: ['author']
        }
    ];
};

export default RouteConfig;
