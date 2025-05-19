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
    title: Yup.string().required('Le titre est obligatoire'),
    desc: Yup.string().required('La description est obligatoire'),
    price: Yup.number()
        .required('Le prix est obligatoire')
        .min(0, 'Le prix doit être positif'),
    stock: Yup.number()
        .required('Le stock est obligatoire')
        .min(0, 'Le stock doit être positif ou nul'),
    category: Yup.string().required('La catégorie est obligatoire'),
    dateRealisation: Yup.date().required('La date de publication est obligatoire')
});

const EditBook = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [book, setBook] = useState(null);

    useEffect(() => {
        loadBookData();
        loadCategories();
    }, [id]);

    const loadCategories = async () => {
        try {
            const response = await bookService.getCategories();
            setCategories(response.data);
        } catch (error) {
            toast.error('Échec du chargement des catégories');
        }
    };

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
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Modifier le livre
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
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Catégorie</InputLabel>
                                <Select
                                    name="category"
                                    value={formik.values.category}
                                    label="Catégorie"
                                    onChange={formik.handleChange}
                                    error={formik.touched.category && Boolean(formik.errors.category)}
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category._id} value={category.name}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                name="dateRealisation"
                                label="Date de publication"
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
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={!formik.isValid || formik.isSubmitting}
                                >
                                    Mettre à jour
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