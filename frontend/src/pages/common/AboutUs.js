import React from 'react';
import { Container, Typography, Paper, Box, Grid, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LibraryBooks, Group, LocalLibrary, Speed, Image } from '@mui/icons-material';

const StyledAvatar = styled(Avatar)({
    width: 180,
    height: 180,
    border: '4px solid #e7486f',
    boxShadow: '0 8px 24px rgba(231, 72, 111, 0.15)',
    margin: '0 auto',
});

const InfoSection = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '2rem',
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        width: '60%',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #e7486f, transparent)',
    }
});

const GradientPaper = styled(Paper)({
    background: 'linear-gradient(135deg, rgba(231, 72, 111, 0.03) 0%, rgba(241, 239, 233, 0.1) 100%)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(231, 72, 111, 0.1)',
    padding: '2rem',
    marginBottom: '2rem',
});

const AboutUs = () => {
    const features = [
        {
            icon: <LibraryBooks sx={{ fontSize: 40, color: '#e7486f' }} />,
            title: 'Digital Library',
            description: 'Access a vast collection of digital books anytime, anywhere.'
        },
        {
            icon: <Group sx={{ fontSize: 40, color: '#e7486f' }} />,
            title: 'Community',
            description: 'Connect with fellow readers and share your literary journey.'
        },
        {
            icon: <LocalLibrary sx={{ fontSize: 40, color: '#e7486f' }} />,
            title: 'Easy Access',
            description: 'Simple rental and purchase system for all your reading needs.'
        },
        {
            icon: <Speed sx={{ fontSize: 40, color: '#e7486f' }} />,
            title: 'Fast Service',
            description: 'Quick delivery and instant access to digital content.'
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 10 }}>
            <Grid container spacing={6} mb={8}>
                {/* E-KITAB Platform Section */}
                <Grid item xs={12} md={6}>
                    <InfoSection>
<Box
  component="img"
  src="/assets/images/LOGO2.png"
  alt="E-KITAB Logo"
  sx={{
    width: '400px',   // ← adapte selon besoin
    height: 'auto',
    mb: 4
  }}
/>
                        <Typography variant="h4" gutterBottom sx={{ color: '#e7486f', fontWeight: 600 }}>
                            E-KITAB Platform
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8 }}>
                            E-KITAB is a digital-first platform reshaping access to literature. We blend modern tech with the timeless joy of reading,
                            offering book lovers an innovative way to rent and buy books online. With a sleek, intuitive interface, E-KITAB empowers
                            users to explore, share, and engage in a growing digital library from anywhere in the world.
                        </Typography>
                    </InfoSection>
                </Grid>

                {/* Developer Profile Section */}
                <Grid item xs={12} md={6}>
                    <InfoSection>
<StyledAvatar
  src="/assets/images/me.jpg"
  alt="E-KITAB Logo"
  sx={{ mb: 4 }}
/>
                        <Typography variant="h4" gutterBottom sx={{ color: '#e7486f', fontWeight: 600 }}>
                            About the Developer
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8 }}>
                            JavaScript Full Stack Developer with a degree in Computer Management. Skilled in web and mobile development using React.js, Vue.js,
                            Node.js, PHP, and Laravel. Adept at UI/UX design with Figma and Canva, as well as database management (SQL/NoSQL). Known for leadership,
                            teamwork, and driving innovative project solutions. Always eager to grow, collaborate, and build powerful digital experiences.
                        </Typography>
                    </InfoSection>
                </Grid>
            </Grid>

            <GradientPaper elevation={0}>
                <Typography variant="h4" align="center" gutterBottom sx={{ color: '#e7486f', mb: 4 }}>
                    Our Features
                </Typography>
                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                p: 2
                            }}>
                                {feature.icon}
                                <Typography variant="h6" sx={{ my: 2, color: '#2A2A2A' }}>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    {feature.description}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </GradientPaper>

            <GradientPaper elevation={0}>
                <Typography variant="h4" gutterBottom sx={{ color: '#e7486f', mb: 3, textAlign: 'center' }}>
                    Get in Touch
                </Typography>
                <Typography variant="body1" align="center" sx={{ color: '#666' }}>
                    We're here to help! Contact our support team at{' '}
                    <Box component="span" sx={{ color: '#e7486f', fontWeight: 500 }}>
                        support@ekitab.com
                    </Box>
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 2, color: '#666' }}>
                    Available Monday - Friday, 9:00 AM - 6:00 PM
                </Typography>
            </GradientPaper>
        </Container>
    );
};

export default AboutUs;
