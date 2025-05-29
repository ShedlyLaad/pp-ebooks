import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LoadingSpinner from '../../components/LoadingSpinner';
import { bookService } from '../../services/bookService';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    desc: Yup.string().required('Description is required'),
    price: Yup.number()
        .required('Price is required')
        .min(0, 'Price must be positive'),
    stock: Yup.number()
        .required('Stock is required')
        .min(0, 'Stock must be zero or positive'),
    category: Yup.string()
        .required('Category is required')
        .min(2, 'Category must contain at least 2 characters'),
    dateRealisation: Yup.date().required('Publication date is required')
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
        validationSchema,        onSubmit: async (values) => {
            setLoading(true);
            try {
                const formData = new FormData();
                
                // Validate and convert numeric values
                const price = parseFloat(values.price);
                const stock = parseInt(values.stock);
                
                if (isNaN(price) || price < 0) {
                    toast.error('Le prix doit être un nombre valide et positif');
                    return;
                }
                if (isNaN(stock) || stock < 0) {
                    toast.error('Le stock doit être un nombre valide et positif');
                    return;
                }

                // Add all form fields to FormData with proper formatting
                formData.append('title', values.title.trim());
                formData.append('desc', values.desc.trim());
                formData.append('price', price);
                formData.append('stock', stock);
                formData.append('category', values.category.trim());
                formData.append('dateRealisation', new Date(values.dateRealisation).toISOString());

                // Add the file if it exists
                if (selectedFile) {
                    formData.append('poster', selectedFile);
                }

                // Send the request
                const response = await bookService.createBook(formData);
                
                if (response.success) {
                    toast.success('Livre ajouté avec succès');
                    navigate('/author/my-books');
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Create book error:', error);
                toast.error(error.message || 'Erreur lors de l\'ajout du livre');
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
        <Container maxWidth="md" sx={{
            py: 4,
            minHeight: '100vh',
            background: 'linear-gradient(135deg, rgba(231, 72, 111, 0.05) 0%, rgba(241, 239, 233, 0.05) 100%)',
        }}>
            <Paper elevation={3} sx={{
                p: 4,
                mt: 4,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(231, 72, 111, 0.1)',
                borderRadius: '20px',
            }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#e7486f' }}>
                    Add New Book
                </Typography>

                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="title"
                                label="Title"
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
                                label="Price"
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
                        </Grid>                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="category"
                                label="Category"
                                value={formik.values.category}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.category && Boolean(formik.errors.category)}
                                helperText={formik.touched.category && formik.errors.category}
                                placeholder="Enter book category"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="dateRealisation"
                                label="Publication Date"
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
                                {selectedFile ? 'Change Image' : 'Add Image'}
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
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading || !formik.isValid}
                                >
                                    Add Book
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