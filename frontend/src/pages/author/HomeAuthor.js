import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    Typography,
    Container,
    Paper,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    IconButton,
    styled,
} from '@mui/material';
import {
    GitHub as GitHubIcon,
    LinkedIn as LinkedInIcon,
    Instagram as InstagramIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
    Search as SearchIcon,
} from '@mui/icons-material';
import { bookService } from '../../services/bookService';
import { rentalService } from '../../services/rentalService';
import { orderService } from '../../services/orderService';
import BookCard from '../../components/BookCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../auth/AuthContext';
import { toast } from 'react-toastify';
import Banner from '../../components/Banner';

const MainContainer = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(90deg, #f1efe9 0%, #f9f7f2 100%)',
    minHeight: '100vh',
    paddingTop: '90px',
    paddingLeft: '100px',
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
    padding: theme.spacing(4),
}));

const HeadingText = styled(Typography)({
    fontFamily: 'Playfair Display, serif',
    color: '#2A2A2A',
    marginBottom: '1rem',
});

const FilterPaper = styled(Paper)({
    padding: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    marginBottom: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
});

const StyledCard = styled(Card)({
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease'
    }
});

const SearchField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(8px)',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
        },
        '&.Mui-focused': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }
    }
});

const FilterSelect = styled(Select)({
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    '&.Mui-focused': {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    }
});

const HomeAuthor = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        sortBy: 'newest',
        category: ''
    });
    const [categories, setCategories] = useState([]);
    const [actionLoading, setActionLoading] = useState({ type: null, id: null });    const loadCategories = useCallback(async () => {
        try {
            const response = await bookService.getCategories();
            setCategories(response);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }, []);    const loadBooks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const booksData = await bookService.searchBooks({
                ...filters,
                category: filters.category || undefined
            });
            setBooks(Array.isArray(booksData) ? booksData : []);
        } catch (err) {
            setError('Failed to load books. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            loadBooks();
        }, 300);

        return () => clearTimeout(debounceTimeout);
    }, [loadBooks]);useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            loadBooks();
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [loadBooks]);const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };    const handleRent = async (book) => {
        try {
            setActionLoading({ type: 'rent', id: book._id });
            // Set due date to 14 days from now
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);
            
            await rentalService.rentBook({
                bookId: book._id,
                dueDate: dueDate.toISOString()
            });
            toast.success('Book rented successfully!');
            navigate('/author/my-rentals');
        } catch (error) {
            toast.error(error.message || 'Failed to rent book');
        } finally {
            setActionLoading({ type: null, id: null });
        }
    };

    const handleBuy = async (book) => {
        try {
            setActionLoading({ type: 'buy', id: book._id });
            await orderService.createOrder({
                bookId: book._id,
                quantity: 1,
                totalAmount: book.price
            });
            toast.success('Book purchased successfully!');
            navigate('/author/my-orders');
        } catch (error) {
            toast.error(error.message || 'Failed to purchase book');
        } finally {
            setActionLoading({ type: null, id: null });
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <MainContainer>
            <Banner userType="author" />
            <ContentWrapper>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <HeadingText variant="h4">
                            Welcome back, {user?.name}!
                        </HeadingText>
                    </Grid>

                    <Grid item xs={12}>
                        <FilterPaper sx={{ boxShadow: 'none', backgroundColor: 'transparent' }}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <SearchField
                                        fullWidth
                                        placeholder="Search books..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <FilterSelect
                                            value={filters.category || ''}
                                            onChange={(e) => handleFilterChange('category', e.target.value)}
                                            displayEmpty
                                            renderValue={(selected) => selected || 'All Categories'}
                                        >                                            <MenuItem value="">All Categories</MenuItem>
                                            {categories.map((category) => (
                                                <MenuItem key={category._id} value={category.name}>
                                                    {category.name}
                                                </MenuItem>
                                            ))}
                                        </FilterSelect>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <FilterSelect
                                            value={filters.sortBy}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            displayEmpty
                                        >
                                            <MenuItem value="newest">Newest First</MenuItem>
                                            <MenuItem value="oldest">Oldest First</MenuItem>
                                        </FilterSelect>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </FilterPaper>
                    </Grid>

                    {books.length === 0 ? (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="h6" color="textSecondary">
                                    No books found matching your criteria.
                                </Typography>
                            </Paper>
                        </Grid>
                    ) : (
                        <Grid item xs={12}>
                            <Grid container spacing={3}>
                                {books.map((book) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                                        <BookCard
                                            book={book}                                            isUser={true}
                                            onRent={() => handleRent(book)}
                                            onBuy={() => handleBuy(book)}
                                            loading={
                                                (actionLoading.type === 'rent' && actionLoading.id === book._id) ||
                                                (actionLoading.type === 'buy' && actionLoading.id === book._id)
                                            }
                                            disableButtons={book.author?._id === user?._id}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    )}                </Grid>                <Box 
                    sx={{ 
                        mt: 6, 
                        p: 4,
                        borderTop: '1px solid rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        maxWidth: '800px',
                        margin: '2rem auto'
                    }}
                >
                    <Box
                        component="img"
                        src="/assets/images/LOGO2.png"
                        alt="BiblioF Logo"
                        sx={{
                            height: '40px',
                            width: 'auto'
                        }}
                    />
                    <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        '& a': {
                            color: '#666',
                            transition: 'color 0.3s ease',
                            '&:hover': {
                                color: '#e7486f'
                            }
                        }
                    }}>
                        <IconButton 
                            component="a" 
                            href="https://github.com/ShedlyLaad" 
                            target="_blank"
                            size="small"
                            aria-label="GitHub"
                        >
                            <GitHubIcon />
                        </IconButton>
                        <IconButton 
                            component="a" 
                            href="https://www.linkedin.com/in/chedlylaadhiby98/" 
                            target="_blank"
                            size="small"
                            aria-label="LinkedIn"
                        >
                            <LinkedInIcon />
                        </IconButton>
                        <IconButton 
                            component="a" 
                            href="https://www.instagram.com/shedlylaadhiby/" 
                            target="_blank"
                            size="small"
                            aria-label="Instagram"
                        >
                            <InstagramIcon />
                        </IconButton>
                    </Box>

                    <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ opacity: 0.7 }}
                    >
                        © 2025 E-KITAB. All rights reserved.
                    </Typography>
                </Box>
            </ContentWrapper>
        </MainContainer>
    );
};

export default HomeAuthor;