import React from 'react';
import { Box, Typography, styled } from '@mui/material';

const BannerContainer = styled(Box)({
    position: 'relative',
    width: '100%',
    height: '400px',
    overflow: 'hidden',
    marginBottom: '2rem',
});

const Video = styled('video')({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
});

const Overlay = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 2,
});

const Content = styled(Box)({
    position: 'relative',
    zIndex: 3,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 20px',
    textAlign: 'center',
    color: '#ffffff',
});

const Banner = ({ userType }) => {
    return (
        <BannerContainer>
            <Video
                autoPlay
                muted
                loop
                playsInline
                src="/assets/videos/Banner_Vid.mp4"
            />
            <Overlay />
            <Content>
                <Typography 
                    variant="h2" 
                    sx={{ 
                        fontFamily: 'Playfair Display',
                        marginBottom: 2,
                        fontSize: { xs: '2rem', md: '3.5rem' },
                        fontWeight: 600
                    }}
                >
                    {userType === 'author' 
                        ? "Welcome to Your Author's Space" 
                        : "Discover Your Next Adventure"}
                </Typography>
                <Typography 
                    variant="h5" 
                    sx={{ 
                        fontFamily: 'Inter',
                        maxWidth: '800px',
                        fontSize: { xs: '1rem', md: '1.5rem' },
                        opacity: 0.9
                    }}
                >
                    {userType === 'author' 
                        ? "Share your stories with the world and connect with your readers" 
                        : "Explore our vast collection of books and embark on new literary journeys"}
                </Typography>
            </Content>
        </BannerContainer>
    );
};

export default Banner;
