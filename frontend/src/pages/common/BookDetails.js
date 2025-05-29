import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Box, 
    Container, 
    Typography, 
    Paper,
    Chip,
    Button,
    Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { bookService } from '../../services/bookService';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BookIcon from '@mui/icons-material/Book';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import DateRangeIcon from '@mui/icons-material/DateRange';
import InventoryIcon from '@mui/icons-material/Inventory';
import { format } from 'date-fns';

const GlobalStyle = styled('div')({
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(90deg, #f1efe9 0%, #f9f7f2 100%)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1
});

const StyledContainer = styled(Container)({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
});

const StyledPaper = styled(Paper)(({ theme }) => ({
    width: '100%',
    maxWidth: 1200,
    padding: theme.spacing(6),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '32px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: theme.spacing(6),
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
        padding: theme.spacing(4),
    },
}));

const BookImageWrapper = styled(Box)({
    position: 'relative',
    perspective: '1000px',
    '&:hover .book-image': {
        transform: 'rotateY(10deg)',
    },
    '&::after': {
        content: '"Hover to peek"',
        position: 'absolute',
        bottom: '-2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.875rem',
        color: 'rgba(0,0,0,0.5)',
        opacity: 0.7,
    },
});

const BookImage = styled('img')({
    width: '100%',
    maxWidth: '450px',
    height: '600px',
    objectFit: 'cover',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    margin: '0 auto',
    display: 'block',
    transition: 'transform 0.5s ease-in-out',
    transformStyle: 'preserve-3d',
});

const InfoRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(4),
    '& .MuiButton-root': {
        backgroundColor: '#e7486f',
        '&:hover': {
            backgroundColor: '#d13d61',
        },
    },
    '& .MuiButton-outlined': {
        borderColor: '#e7486f',
        color: '#e7486f',
        backgroundColor: 'transparent',
        '&:hover': {
            backgroundColor: 'rgba(231, 72, 111, 0.08)',
        },
    },
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
    },
}));

const DetailChip = styled(Chip)(({ theme }) => ({
    fontSize: '1rem',
    padding: theme.spacing(2),
    borderColor: '#e7486f',
    color: '#e7486f',
    '& .MuiChip-icon': {
        fontSize: '1.2rem',
        color: '#e7486f',
    },
}));

const BookDetails = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await bookService.getBookPublicDetails(id);
                setBook(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Failed to load book details');
                setLoading(false);
            }
        };

        fetchBookDetails();
    }, [id]);

    if (loading) return (
        <StyledContainer>
            <Typography variant="h5">Loading...</Typography>
        </StyledContainer>
    );
    
    if (error) return (
        <StyledContainer>
            <Typography variant="h5" color="error">{error}</Typography>
        </StyledContainer>
    );

    if (!book) return (
        <StyledContainer>
            <Typography variant="h5">Book not found</Typography>
        </StyledContainer>
    );

    return (
        <>
            <GlobalStyle />
            <StyledContainer>
                <StyledPaper elevation={3}>
                    <BookImageWrapper>
                        <BookImage
                            className="book-image"
                            src={book.poster ? `http://localhost:8000/books/${book.poster.replace(/^.*[\\\/]/, '')}` : '/placeholder-book.jpg'}
                            title={book.title}
                            alt={book.title}
                        />
                    </BookImageWrapper>
                    
                    <Box>
                        <Typography 
                            variant="h3" 
                            component="h1" 
                            gutterBottom 
                            sx={{ 
                                fontWeight: 'bold',
                                color: '#2c2c2c',
                                mb: 4
                            }}
                        >
                            {book.title}
                        </Typography>

                        <InfoRow>
                            <DetailChip
                                icon={<PersonIcon />}
                                label={`Author: ${book.authorName}`}
                                variant="outlined"
                            />
                            <DetailChip
                                icon={<CategoryIcon />}
                                label={`Category: ${book.category}`}
                                color="primary"
                                variant="outlined"
                            />
                        </InfoRow>

                        <InfoRow>
                            <DetailChip
                                icon={<DateRangeIcon />}
                                label={`Published: ${format(new Date(book.dateRealisation), 'MMMM d, yyyy')}`}
                                variant="outlined"
                            />
                            <DetailChip
                                icon={<InventoryIcon />}
                                label={`${book.stock} copies available`}
                                color={book.stock > 0 ? 'success' : 'error'}
                                variant="outlined"
                            />
                        </InfoRow>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Description
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ 
                            color: 'text.secondary',
                            lineHeight: 1.8,
                            fontSize: '1.1rem',
                            textAlign: 'justify'
                        }}>
                            {book.desc}
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                ${book.price}
                            </Typography>
                        </Box>

                        <ButtonGroup>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<ShoppingCartIcon />}
                                fullWidth
                                sx={{
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    textTransform: 'none'
                                }}
                            >
                                Buy Now
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="large"
                                startIcon={<BookIcon />}
                                fullWidth
                                sx={{
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    textTransform: 'none'
                                }}
                            >
                                Rent Book
                            </Button>
                        </ButtonGroup>
                    </Box>
                </StyledPaper>
            </StyledContainer>
        </>
    );
};

export default BookDetails;