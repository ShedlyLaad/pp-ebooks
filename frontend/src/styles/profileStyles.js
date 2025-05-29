import { styled } from '@mui/material/styles';
import { Box, Paper, Typography } from '@mui/material';

export const ProfileContainer = styled(Box)(({ theme }) => ({
    background: 'linear-gradient(90deg, #f1efe9 0%, #f9f7f2 100%)',
    minHeight: '100vh',
    padding: '2rem',
    [theme.breakpoints.down('sm')]: {
        padding: '1rem',
    }
}));

export const ProfileCard = styled(Paper)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '3rem',
    padding: '3rem',
    borderRadius: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
        padding: '2rem',
        gap: '2rem'
    },
    [theme.breakpoints.down('sm')]: {
        padding: '1.5rem',
        gap: '1.5rem'
    }
}));

export const ProfileTitle = styled(Typography)({
    fontFamily: '"Playfair Display", serif',
    fontSize: '2.5rem',
    color: '#2c2c2c',
    marginBottom: '0.5rem'
});

export const ProfileRole = styled(Typography)({
    color: '#e7486f',
    fontSize: '1.1rem',
    fontWeight: 500,
    marginBottom: '2rem'
});
