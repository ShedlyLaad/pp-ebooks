import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Avatar } from '@mui/material';

const ProfileImageContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    textAlign: 'center',
    marginBottom: '2rem',
    '&:hover .edit-indicator': {
        opacity: 1
    }
}));

const ProfileImage = styled(Avatar)(({ theme }) => ({
    width: '300px',
    height: '300px',
    margin: '0 auto',
    borderRadius: '50%',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
        transform: 'scale(1.02)'
    },
    [theme.breakpoints.down('sm')]: {
        width: '200px',
        height: '200px'
    }
}));

const EditIndicator = styled(Box)({
    position: 'absolute',
    bottom: '-1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#e7486f',
    fontSize: '0.875rem',
    opacity: 0,
    transition: 'opacity 0.3s ease'
});

const ImageUpload = ({ imagePreview, handleClick, name }) => (
    <ProfileImageContainer>
        <ProfileImage
            src={imagePreview}
            onClick={handleClick}
        >
            {name?.charAt(0)}
        </ProfileImage>
        <EditIndicator className="edit-indicator">
            Cliquez pour modifier
        </EditIndicator>
    </ProfileImageContainer>
);

export default ImageUpload;
