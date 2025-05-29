import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Container,
    Grid,
    TextField,
    Button,
    Typography,
    Paper,
    Divider,
    Stack,
    Avatar,
    MenuItem,
    CircularProgress,
    IconButton,
    useMediaQuery,
} from '@mui/material';
import {
    Check as CheckIcon,
    Close as CloseIcon,
    PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';
import { ProfileContainer, ProfileCard, ProfileTitle, ProfileRole } from '../../styles/profileStyles';
import ImageUpload from '../../components/profile/ImageUpload';

const Profile = () => {
    const matches = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        email: '',
        phone: '',
        timezone: '+1 GMT',
    });
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const timezones = [
        { value: '+0 GMT', label: '(GMT +0) London' },
        { value: '+1 GMT', label: '(GMT +1) Paris, Berlin' },
        { value: '+2 GMT', label: '(GMT +2) Cairo, Istanbul' },
        { value: '+3 GMT', label: '(GMT +3) Moscow, Dubai' },
        { value: '+4 GMT', label: '(GMT +4) Dubai' },
        { value: '+5 GMT', label: '(GMT +5) Karachi' },
    ];

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                lastname: user.lastname || '',
                email: user.email || '',
                phone: user.phone || '',
                timezone: user.timezone || '+1 GMT',
            });
            if (user.profileImage) {
                setImagePreview(user.profileImage);
            }
        }
    }, [user]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'First name is required';
        if (!formData.lastname.trim()) newErrors.lastname = 'Last name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }
        if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5000000) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            setImageLoading(true);
            try {
                const formData = new FormData();
                formData.append('profileImage', file);
                const updatedUser = await userService.updateProfileImage(formData);
                updateUser(updatedUser);
                setImagePreview(URL.createObjectURL(file));
                toast.success('Profile photo updated successfully');
            } catch (error) {
                toast.error('Failed to update profile photo');
            } finally {
                setImageLoading(false);
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);
        try {
            const updatedUser = await userService.updateProfile(formData);
            updateUser(updatedUser);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                name: user.name || '',
                lastname: user.lastname || '',
                email: user.email || '',
                phone: user.phone || '',
                timezone: user.timezone || '+1 GMT',
            });
            setImagePreview(user.profileImage || null);
            setErrors({});
        }
    };

    return (
        <ProfileContainer>
            <ProfileCard>
                <Box sx={{ 
                    width: '100%',
                    // [theme.breakpoints.down('md')]: {
                    //     maxWidth: '300px',
                    //     margin: '0 auto'
                    // }
                }}>
                    <ImageUpload 
                        imagePreview={imagePreview}
                        handleClick={handleImageClick}
                        name={formData.name}
                    />
                </Box>

                <Box>
                    <ProfileTitle variant="h1" sx={{
                        fontSize: {
                            xs: '2rem',
                            sm: '2.5rem',
                            md: '3rem'
                        },
                        textAlign: {
                            xs: 'center',
                            md: 'left'
                        }
                    }}>
                        {formData.name} {formData.lastname}
                    </ProfileTitle>
                    <ProfileRole>
                        {user?.role === 'author' ? 'Author' : 'Reader'}
                    </ProfileRole>

                    <Typography 
                        variant="body1" 
                        sx={{ 
                            color: 'text.secondary',
                            lineHeight: 1.8,
                            mb: 4,
                            fontFamily: 'sans-serif'
                        }}
                    >
                        Passionate about reading and active member of our literary community.
                    </Typography>

                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom sx={{ color: '#e7486f', fontWeight: 600 }}>
                        Personal Information
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={{ xs: 2, md: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    required
                                    sx={{
                                        ...textFieldStyle,
                                        '& .MuiInputBase-root': {
                                            fontSize: { xs: '0.9rem', sm: '1rem' }
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    error={!!errors.lastname}
                                    helperText={errors.lastname}
                                    required
                                    sx={textFieldStyle}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    error={!!errors.phone}
                                    helperText={errors.phone}
                                    sx={textFieldStyle}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Time Zone"
                                    name="timezone"
                                    value={formData.timezone}
                                    onChange={handleChange}
                                    required
                                    sx={textFieldStyle}
                                >
                                    {timezones.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    required
                                    sx={textFieldStyle}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" gutterBottom sx={{ color: '#e7486f', fontWeight: 600 }}>
                                    Authentification
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Détails SAML"
                                    value="https://auth.bibliof.com/saml/login"
                                    disabled
                                    sx={{ 
                                        mt: 2,
                                        opacity: 0.7,
                                        '& .Mui-disabled': {
                                            WebkitTextFillColor: '#666',
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Stack 
                                    direction={{ xs: 'column', sm: 'row' }} 
                                    spacing={2} 
                                    justifyContent="flex-end"
                                    sx={{ mt: { xs: 2, sm: 0 } }}
                                >
                                    <Button
                                        fullWidth={matches}
                                        variant="outlined"
                                        onClick={handleCancel}
                                        startIcon={<CloseIcon />}
                                        disabled={loading}
                                        sx={{
                                            borderColor: '#e7486f',
                                            color: '#e7486f',
                                            '&:hover': {
                                                borderColor: '#d13d61',
                                                backgroundColor: 'rgba(231, 72, 111, 0.04)',
                                            },
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        fullWidth={matches}
                                        type="submit"
                                        variant="contained"
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                                        disabled={loading}
                                        sx={{
                                            bgcolor: '#e7486f',
                                            '&:hover': {
                                                bgcolor: '#d13d61',
                                            },
                                            '&.Mui-disabled': {
                                                bgcolor: 'rgba(231, 72, 111, 0.7)',
                                            },
                                        }}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </ProfileCard>
        </ProfileContainer>
    );
};

const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
            borderColor: '#e7486f',
        },
    },
    '& .MuiFormLabel-root.Mui-focused': {
        color: '#e7486f',
    },
};

export default Profile;
