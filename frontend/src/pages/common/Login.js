import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    InputAdornment,
    IconButton,
    Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuth } from '../../auth/AuthContext';

const validationSchema = yup.object({
    email: yup
        .string()
        .email('Entrez un email valide')
        .required('Email est requis'),
    password: yup
        .string()
        .required('Mot de passe est requis'),
});

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                const user = await login(values);
                
                // Redirect based on user role
                switch (user.role) {
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'author':
                        navigate('/author');
                        break;
                    default:
                        navigate('/user');
                        break;
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Email ou mot de passe invalide');
            }
        },
    });

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Connexion à E-KITAB
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
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
                />

                <TextField
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

                <Button
                    color="primary"
                    variant="contained"
                    fullWidth
                    type="submit"
                    size="large"
                    sx={{ mt: 3, mb: 2 }}
                >
                    Se connecter
                </Button>
            </form>

            <Typography variant="body2" align="center">
                Vous n'avez pas de compte ?{' '}
                <Link to="/register" style={{ textDecoration: 'none' }}>
                    Inscrivez-vous ici
                </Link>
            </Typography>
        </Box>
    );
};

export default Login;