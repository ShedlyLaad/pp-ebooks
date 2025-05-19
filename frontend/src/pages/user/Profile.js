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
} from '@mui/material';
import {
    Check as CheckIcon,
    Close as CloseIcon,
    PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';

const Profile = () => {
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
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper 
                elevation={0}
                sx={{ 
                    p: 4, 
                    borderRadius: '16px',
                    bgcolor: '#f1efe9',
                    border: '1px solid rgba(231, 72, 111, 0.1)'
                }}
            >
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Stack direction="row" spacing={3} alignItems="center">
                            <Box sx={{ position: 'relative' }}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <Avatar
                                    src={imagePreview}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        fontSize: '2.5rem',
                                        cursor: 'pointer',
                                        border: '4px solid #e7486f',
                                        bgcolor: '#e7486f',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            opacity: 0.9,
                                        }
                                    }}
                                    onClick={handleImageClick}
                                >
                                    {imageLoading ? 
                                        <CircularProgress size={40} sx={{ color: '#fff' }} />
                                        : formData.name?.charAt(0)
                                    }
                                </Avatar>
                                <IconButton
                                    size="small"
                                    onClick={handleImageClick}
                                    sx={{
                                        position: 'absolute',
                                        bottom: 5,
                                        right: 5,
                                        backgroundColor: '#e7486f',
                                        color: '#fff',
                                        '&:hover': {
                                            backgroundColor: '#d13d61',
                                        },
                                        width: 32,
                                        height: 32,
                                    }}
                                >
                                    <PhotoCameraIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Box>
                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        color: '#e7486f',
                                        fontWeight: 600,
                                        mb: 1
                                    }}
                                >
                                    My Profile
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Manage your personal information and account settings
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>

                    <Grid item xs={12}>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
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
                                        sx={textFieldStyle}
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
                                        Authentication
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label="SAML Details"
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
                                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                                        <Button
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
                    </Grid>
                </Grid>
            </Paper>
        </Container>
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
