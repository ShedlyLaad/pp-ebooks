import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
import { toast } from 'react-toastify';
import { bookService } from '../../services/bookService';
import LoadingSpinner from '../../components/LoadingSpinner';

const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    desc: Yup.string().required('Description is required'),
    price: Yup.number()
        .required('Price is required')
        .min(0, 'Price must be positive'),
    stock: Yup.number()
        .required('Stock is required')
        .min(0, 'Stock must be zero or positive'),
    category: Yup.string().required('Category is required'),
    dateRealisation: Yup.date().required('Publication date is required')
});

const EditBook = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(false);    const [book, setBook] = useState(null);

    useEffect(() => {
        loadBookData();
    }, [id]);

    const loadBookData = async () => {
        setLoading(true);
        try {
            const response = await bookService.getBook(id);
            setBook(response.data);
            formik.setValues({
                title: response.data.title,
                desc: response.data.desc,
                price: response.data.price,
                stock: response.data.stock,
                category: response.data.category?.name || '',
                dateRealisation: new Date(response.data.dateRealisation).toISOString().split('T')[0]
            });
        } catch (error) {
            toast.error('Échec du chargement du livre');
            navigate('/author/my-books');
        } finally {
            setLoading(false);
        }
    };

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
                const cleanedValues = {
                    ...values,
                    title: values.title.trim(),
                    desc: values.desc.trim(),
                    category: values.category.trim(),
                    price: Number(values.price),
                    stock: Number(values.stock)
                };

                await bookService.updateBook(id, cleanedValues);
                toast.success('Livre mis à jour avec succès');
                navigate('/author/my-books');
            } catch (error) {
                const errorMessage = error?.response?.data?.message || error.message || 'Échec de la mise à jour';
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        }
    });

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
                    Edit Book
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
                                label="Publication date"
                                type="date"
                                value={formik.values.dateRealisation}
                                onChange={formik.handleChange}
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
                                error={formik.touched.desc && Boolean(formik.errors.desc)}
                                helperText={formik.touched.desc && formik.errors.desc}
                            />
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
                                    disabled={!formik.isValid || formik.isSubmitting}
                                >
                                    Update
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default EditBook;