import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    styled,
    Paper,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bookService } from '../../services/bookService';
import BookCard from '../../components/BookCard';
import LoadingSpinner from '../../components/LoadingSpinner';

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

const ActionBar = styled(Paper)({
    padding: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
});

const StyledButton = styled(Button)({
    backgroundColor: '#e7486f',
    color: '#ffffff',
    '&:hover': {
        backgroundColor: '#d13d61',
    },
});

const MyBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const response = await bookService.getMyBooks();
            setBooks(response.data);
        } catch (error) {
            toast.error('Failed to load books');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (book) => {
        navigate(`/author/edit-book/${book._id}`, { state: { book } });
    };

    const handleDelete = async (book) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await bookService.deleteBook(book._id);
                toast.success('Book deleted successfully');
                loadBooks();
            } catch (error) {
                toast.error('Failed to delete book');
            }
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <MainContainer>
            <ContentWrapper maxWidth="lg">
                <ActionBar elevation={0}>
                    <HeadingText variant="h4">
                        My Books
                    </HeadingText>
                    <StyledButton
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/author/add-book')}
                    >
                        Add New Book
                    </StyledButton>
                </ActionBar>

                {books.length === 0 ? (
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: 4, 
                            textAlign: 'center',
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '16px',
                        }}
                    >
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            You haven't published any books yet
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Start by adding your first book to your collection
                        </Typography>
                        <StyledButton
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/author/add-book')}
                        >
                            Add Your First Book
                        </StyledButton>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {books.map((book) => (
                            <Grid item xs={12} sm={6} md={4} key={book._id}>                                <BookCard
                                    book={book}
                                    onEdit={() => handleEdit(book)}
                                    onDelete={() => handleDelete(book)}
                                    isAuthorView={true}
                                    hideActions={true}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </ContentWrapper>
        </MainContainer>
    );
};

export default MyBooks;