import React from 'react';
import { Container, Typography, Paper, Box, Grid } from '@mui/material';
import { LibraryBooks, Group, LocalLibrary, Speed } from '@mui/icons-material';

const AboutUs = () => {
    const features = [
        {
            icon: <LibraryBooks sx={{ fontSize: 40, color: '#053f10' }} />,
            title: 'Extensive Collection',
            description: 'Access to thousands of books across various genres and categories.'
        },
        {
            icon: <Group sx={{ fontSize: 40, color: '#053f10' }} />,
            title: 'Community',
            description: 'Join a community of book lovers and share your reading experiences.'
        },
        {
            icon: <LocalLibrary sx={{ fontSize: 40, color: '#053f10' }} />,
            title: 'Easy Rentals',
            description: 'Simple and efficient book rental system with flexible return policies.'
        },
        {
            icon: <Speed sx={{ fontSize: 40, color: '#053f10' }} />,
            title: 'Quick Service',
            description: 'Fast processing of orders and rentals with real-time tracking.'
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography
                variant="h2"
                component="h1"
                align="center"
                gutterBottom
                sx={{ color: '#053f10', fontWeight: 'bold', mb: 6 }}
            >
                About BiblioF
            </Typography>

            <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
                <Typography variant="h5" gutterBottom sx={{ color: '#053f10' }}>
                    Our Mission
                </Typography>
                <Typography variant="body1" paragraph>
                    BiblioF is dedicated to making literature accessible to everyone. We believe in the power 
                    of books to educate, inspire, and transform lives. Our platform connects readers with their 
                    next favorite book through an easy-to-use rental and purchase system.
                </Typography>
                <Typography variant="body1" paragraph>
                    Founded with the vision of creating a modern library experience, BiblioF combines the 
                    traditional love of books with contemporary technology to provide a seamless reading 
                    experience for our community.
                </Typography>
            </Paper>

            <Grid container spacing={4}>
                {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                p: 2
                            }}
                        >
                            {feature.icon}
                            <Typography variant="h6" sx={{ my: 2, color: '#053f10' }}>
                                {feature.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {feature.description}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            <Paper elevation={3} sx={{ p: 4, mt: 6 }}>
                <Typography variant="h5" gutterBottom sx={{ color: '#053f10' }}>
                    Contact Us
                </Typography>
                <Typography variant="body1" paragraph>
                    We're always here to help! If you have any questions, suggestions, or concerns, 
                    please don't hesitate to reach out to our support team at support@bibliof.com
                </Typography>
                <Typography variant="body1">
                    Operating Hours: Monday - Friday, 9:00 AM - 6:00 PM
                </Typography>
            </Paper>
        </Container>
    );
};

export default AboutUs;