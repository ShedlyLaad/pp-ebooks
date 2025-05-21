import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Typography, Slide } from '@mui/material';
import Logo1 from '../images/Logo1.png';

const AuthLayout = ({ title }) => {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    setShowLogo(true);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'hsl(218, 41%, 15%)',
        backgroundImage: `
          radial-gradient(650px circle at 0% 0%, hsl(218, 41%, 35%) 15%, hsl(218, 41%, 30%) 35%, hsl(218, 41%, 20%) 75%, hsl(117, 22.40%, 19.20%) 80%, transparent 100%),
          radial-gradient(1250px circle at 100% 100%, hsl(157, 72.30%, 73.10%) 15%, hsl(218, 41%, 30%) 35%, hsl(218, 41%, 20%) 75%, hsl(218, 41%, 19%) 80%, transparent 100%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: '90%',
          maxWidth: 1100,
          position: 'relative',
          zIndex: 1,
          bgcolor: 'transparent',
        }}
      >
        <Box
          sx={{
            flex: 1,
            pr: { md: 5 },
            mb: { xs: 4, md: 0 },
            color: 'hsl(218, 81%, 95%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Slide direction="up" in={showLogo} timeout={2000}>
              <Box
                component="img"
                src={Logo1}
                alt="Logo"
                sx={{
                  height: { xs: 200, md: 250 },
                  width: 'auto',
                  userSelect: 'none',
                  filter: 'brightness(1.1)',
                }}
              />
            </Slide>

            <Typography
              variant="h5"
              component="h4"
              sx={{
                fontWeight: 'bold',
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              <br />
              <Box component="span" sx={{ color: 'hsl(0, 0.00%, 100.00%)' }}></Box>
            </Typography>
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: 'hsl(219, 24.50%, 70.40%)',
              mt: 3,
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            Simplifiez la lecture, explorez, louez ou achetez vos livres en toute facilité.
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              p: 5,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(25px) saturate(180%)',
              borderRadius: 2,
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              width: '100%',
              maxWidth: 420,
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              textAlign="center"
              mb={3}
              fontWeight="medium"
            >
              {title}
            </Typography>
            <Outlet />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;
