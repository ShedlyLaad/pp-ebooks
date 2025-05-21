import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Box
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LoadingSpinner from '../../components/LoadingSpinner';
import { bookService } from '../../services/bookService';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
    title: Yup.string().required('Le titre est obligatoire'),
    desc: Yup.string().required('La description est obligatoire'),
    price: Yup.number()
        .required('Le prix est obligatoire')
        .min(0, 'Le prix doit être positif'),
    stock: Yup.number()
        .required('Le stock est obligatoire')
        .min(0, 'Le stock doit être positif ou nul'),
    category: Yup.string()
        .required('La catégorie est obligatoire')
        .min(2, 'La catégorie doit contenir au moins 2 caractères'),
    dateRealisation: Yup.date().required('La date de publication est obligatoire')
});

const AddBook = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const formik = useFormik({
        initialValues: {
            title: '',
            desc: '',
            price: '',
            stock: '',
            category: '',
            dateRealisation: new Date().toISOString().split('T')[0]
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                // Create FormData object
                const formData = new FormData();
                
                // Add all form fields to FormData
                Object.keys(values).forEach(key => {
                    formData.append(key, values[key]);
                });

                // Add the file if it exists
                if (selectedFile) {
                    formData.append('poster', selectedFile);
                }

                // Send the request
                const response = await bookService.createBook(formData);
                
                toast.success('Livre ajouté avec succès');
                navigate('/author/my-books');
            } catch (error) {
                console.error('Create book error:', error);
                toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du livre');
            } finally {
                setLoading(false);
            }
        }
    });

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Ajouter un nouveau livre
                </Typography>

                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="title"
                                label="Titre"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.title && Boolean(formik.errors.title)}
                                helperText={formik.touched.title && formik.errors.title}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="price"
                                label="Prix"
                                type="number"
                                value={formik.values.price}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.price && Boolean(formik.errors.price)}
                                helperText={formik.touched.price && formik.errors.price}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="stock"
                                label="Stock"
                                type="number"
                                value={formik.values.stock}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.stock && Boolean(formik.errors.stock)}
                                helperText={formik.touched.stock && formik.errors.stock}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="category"
                                label="Catégorie"
                                value={formik.values.category}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.category && Boolean(formik.errors.category)}
                                helperText={formik.touched.category && formik.errors.category}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="dateRealisation"
                                label="Date de publication"
                                type="date"
                                value={formik.values.dateRealisation}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.dateRealisation && Boolean(formik.errors.dateRealisation)}
                                helperText={formik.touched.dateRealisation && formik.errors.dateRealisation}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="desc"
                                label="Description"
                                multiline
                                rows={4}
                                value={formik.values.desc}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.desc && Boolean(formik.errors.desc)}
                                helperText={formik.touched.desc && formik.errors.desc}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                                {previewUrl && (
                                    <Box
                                        component="img"
                                        src={previewUrl}
                                        alt="Preview"
                                        sx={{
                                            maxWidth: '100%',
                                            height: 200,
                                            objectFit: 'contain',
                                            mb: 2
                                        }}
                                    />
                                )}
                            </Box>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                sx={{ width: '100%' }}
                            >
                                {selectedFile ? 'Changer l\'image' : 'Ajouter une image'}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/author/my-books')}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading || !formik.isValid}
                                >
                                    Ajouter le livre
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default AddBook;