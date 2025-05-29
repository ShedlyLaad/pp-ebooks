import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { bookService } from '../../services/bookService';
import { categoryService } from '../../services/categoryService'; // Ajout de l'import
import {
    Container,
    Grid,
    Typography,
    Box,
    Button,
    Avatar,
    IconButton,
    styled,
    TextField,
    InputAdornment,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { ArrowForward, ArrowBack, ArrowForwardIos, Search as SearchIcon } from '@mui/icons-material';
import BookCard from '../../components/BookCard';
import LoadingSpinner from '../../components/LoadingSpinner';
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

const HomeUser = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);    const [filters, setFilters] = useState({
        search: '',
        sortBy: 'newest',
        category: ''
    });
    const [actionLoading, setActionLoading] = useState({ type: null, id: null });
    const [categories, setCategories] = useState([]);    const loadCategories = useCallback(async () => {
        try {
            const categoriesResponse = await categoryService.getCategories();
            setCategories(categoriesResponse);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }, []);

    const loadBooks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {            
            const booksResponse = await bookService.searchBooks({
                ...filters,
                category: filters.category || undefined
            });
            setBooks(Array.isArray(booksResponse) ? booksResponse : []);
        } catch (error) {
            setError(error.message || 'Failed to load books');
        } finally {
            setLoading(false);
        }
    }, [filters]);    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            loadBooks();
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [loadBooks]);

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <MainContainer>
            <Banner userType="reader" />
            <ContentWrapper maxWidth="xl">                <Box mb={6}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 3, 
                        mb: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                    }}>
                        <Avatar 
                            sx={{ 
                                width: 80, 
                                height: 80, 
                                bgcolor: '#e7486f',
                                fontSize: '2rem'
                            }}
                        >
                            {user?.name?.charAt(0) || 'G'}
                        </Avatar>
                        <Box>
                            <Typography variant="h4" sx={{ fontFamily: 'Playfair Display, serif' }}>
                                Welcome back, {user?.name || 'Guest'}!
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                {user?.email}
                            </Typography>
                        </Box>
                    </Box>
                    <HeadingText variant="h2" gutterBottom>
                        Keep the story going...
                    </HeadingText>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontFamily: 'Inter' }}>
                        Discover your next favorite book from our curated collection
                    </Typography>
                </Box>

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
                                >                                    <MenuItem value="">All Categories</MenuItem>
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

                {error ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="error" gutterBottom>{error}</Typography>
                        <Button 
                            variant="contained" 
                            onClick={loadBooks}
                            sx={{ 
                                mt: 2,
                                backgroundColor: '#2A2A2A',
                                '&:hover': { backgroundColor: '#404040' }
                            }}
                        >
                            Try Again
                        </Button>
                    </Box>
                ) : loading ? (
                    <LoadingSpinner />
                ) : books.length === 0 ? (
                    <Box 
                        sx={{ 
                            textAlign: 'center',
                            py: 8,
                            backgroundColor: 'rgba(255,255,255,0.7)',
                            borderRadius: '16px',
                        }}
                    >
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No books found matching your criteria.
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Try adjusting your filters to find more books.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Typography 
                            variant="h5" 
                            gutterBottom 
                            sx={{ 
                                fontFamily: 'Playfair Display',
                                mb: 3 
                            }}
                        >
                            {books.length} Book{books.length !== 1 ? 's' : ''} Found
                        </Typography>
                        <Grid container spacing={3}>
                            {books.map((book) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                                    <BookCard
                                        book={book}
                                        isActionLoading={actionLoading.id === book._id}
                                        actionLoadingType={actionLoading.type}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}
                
                <Box 
                    sx={{ 
                        mt: 6, 
                        textAlign: 'center',
                        p: 4,
                        borderTop: '1px solid rgba(0,0,0,0.1)'
                    }}
                >
                    <Typography variant="body1" color="text.secondary">
                        Discover more books every day with{' '}
                        <Box component="span" sx={{ color: '#e7486f', fontWeight: 600 }}>
                            BiblioF
                        </Box>
                    </Typography>
                </Box>
            </ContentWrapper>
        </MainContainer>
    );
};

export default HomeUser;