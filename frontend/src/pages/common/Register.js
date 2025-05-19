import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    InputAdornment,
    IconButton,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../../auth/AuthContext';

const validationSchema = yup.object({
    name: yup
        .string()
        .required('Le nom est requis')
        .min(2, 'Le nom doit contenir au moins 2 caractères'),
    lastname: yup
        .string()
        .required('Le prénom est requis')
        .min(2, 'Le prénom doit contenir au moins 2 caractères'),
    email: yup
        .string()
        .email('Entrez un email valide')
        .required('Email est requis'),
    password: yup
        .string()
        .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
        .required('Mot de passe est requis'),
    role: yup
        .string()
        .oneOf(['user', 'author', 'admin'], 'Rôle invalide')
        .required('Rôle est requis'),
    photo: yup
        .string()
        .nullable()
});

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');    const formik = useFormik({
        initialValues: {
            name: '',
            lastname: '',
            email: '',
            password: '',
            role: 'user',
            photo: ''
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                // Clear any previous errors
                setError('');
                console.log('Submitting registration with values:', values);
                
                const response = await register(values);
                console.log('Registration response:', response);

                // The auth context will handle token storage and user state
                // Just need to handle navigation here
                switch (values.role) {
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'author':
                        navigate('/author');
                        break;
                    default:
                        navigate('/user/home');
                }
            } catch (err) {
                console.error('Registration error:', err);
                setError(err?.response?.data?.message || err.message || "Erreur lors de l'inscription");
            }
        },
    });

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Créer un compte
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
                <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Nom"
                    margin="normal"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                />

                <TextField
                    fullWidth
                    id="lastname"
                    name="lastname"
                    label="Prénom"
                    margin="normal"
                    value={formik.values.lastname}
                    onChange={formik.handleChange}
                    error={formik.touched.lastname && Boolean(formik.errors.lastname)}
                    helperText={formik.touched.lastname && formik.errors.lastname}
                />

                <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    margin="normal"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                />                <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    margin="normal"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel id="role-label">Type de compte</InputLabel>
                    <Select
                        labelId="role-label"
                        id="role"
                        name="role"
                        value={formik.values.role}
                        label="Type de compte"
                        onChange={formik.handleChange}
                        error={formik.touched.role && Boolean(formik.errors.role)}
                    >
                        <MenuItem value="user">Lecteur</MenuItem>
                        <MenuItem value="author">Auteur</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    id="photo"
                    name="photo"
                    label="URL de la photo (optionnel)"
                    margin="normal"
                    value={formik.values.photo}
                    onChange={formik.handleChange}
                    error={formik.touched.photo && Boolean(formik.errors.photo)}
                    helperText={formik.touched.photo && formik.errors.photo}
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel id="role-label">Rôle</InputLabel>
                    <Select
                        labelId="role-label"
                        id="role"
                        name="role"
                        value={formik.values.role}
                        label="Rôle"
                        onChange={formik.handleChange}
                        error={formik.touched.role && Boolean(formik.errors.role)}
                    >
                        <MenuItem value="user">Utilisateur</MenuItem>
                        <MenuItem value="author">Auteur</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    color="primary"
                    variant="contained"
                    fullWidth
                    type="submit"
                    size="large"
                    sx={{ mt: 3, mb: 2 }}
                >
                    S'inscrire
                </Button>
            </form>

            <Typography variant="body2" align="center">
                Vous avez déjà un compte?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                    Connectez-vous ici
                </Link>
            </Typography>
        </Box>
    );
};

export default Register;