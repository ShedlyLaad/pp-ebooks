import { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { bookService } from '../../services/bookService';
import LoadingSpinner from '../../components/LoadingSpinner';

const validationSchema = Yup.object({
    title: Yup.string()
        .required('Le titre est obligatoire')
        .min(2, 'Le titre doit contenir au moins 2 caractères'),
    author: Yup.string()
        .required("L'auteur est obligatoire")
        .min(2, "Le nom de l'auteur doit contenir au moins 2 caractères"),
    price: Yup.number()
        .required('Le prix est obligatoire')
        .min(0, 'Le prix doit être positif')
        .typeError('Le prix doit être un nombre'),
    desc: Yup.string()
        .required('La description est obligatoire')
        .min(10, 'La description doit contenir au moins 10 caractères'),
    category: Yup.string()
        .required('La catégorie est obligatoire')
        .min(2, 'La catégorie doit contenir au moins 2 caractères'),
    stock: Yup.number()
        .required('Le stock est obligatoire')
        .min(0, 'Le stock doit être positif ou nul')
        .integer('Le stock doit être un nombre entier')
        .typeError('Le stock doit être un nombre'),
    dateRealisation: Yup.date()
        .required('La date de publication est obligatoire')
        .max(new Date(), 'La date ne peut pas être dans le futur')
        .typeError('Date invalide'),
    poster: Yup.mixed()
});

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [categories, setCategories] = useState([]);
    const [previewImage, setPreviewImage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        loadBooks();
        loadCategories();
    }, []);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const response = await bookService.getAllBooks();
            // Handle both array response and response with data property
            const booksData = Array.isArray(response.data) ? response.data : response.data?.data || [];
            setBooks(booksData);
        } catch (error) {
            console.error('Error loading books:', error);
            toast.error('Échec du chargement des livres');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await bookService.getCategories();
            // Handle both array response and response with data property
            const categoriesData = Array.isArray(response.data) ? response.data : response.data?.data || [];
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading categories:', error);
            toast.error('Échec du chargement des catégories');
        }
    };

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
    };    const formik = useFormik({
        initialValues: {
            title: '',
            author: '',
            price: '',
            desc: '',
            category: '',
            stock: '',
            dateRealisation: new Date().toISOString().split('T')[0],
            poster: null
        },
        validationSchema,        onSubmit: async (values) => {
            try {
                setLoading(true);
                const formData = new FormData();
                
                // Valider et convertir les champs numériques
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

                // Ajouter les champs au FormData
                formData.append('title', values.title.trim());
                formData.append('author', values.author.trim());
                formData.append('price', price);
                formData.append('desc', values.desc.trim());
                formData.append('category', values.category);  // Déjà le nom de la catégorie
                formData.append('stock', stock);
                formData.append('dateRealisation', values.dateRealisation);

                if (selectedFile) {
                    formData.append('poster', selectedFile);
                }

                if (editingBook) {
                    await bookService.updateBook(editingBook._id, formData);
                    toast.success('Livre mis à jour avec succès');
                } else {
                    await bookService.createBook(formData);
                    toast.success('Livre créé avec succès');
                }
                
                handleCloseDialog();
                loadBooks();
            } catch (error) {
                console.error('Erreur:', error);
                toast.error(error.response?.data?.message || error.message || 'Une erreur est survenue lors de la sauvegarde');
            } finally {
                setLoading(false);
            }
        },
    });    const handleOpenDialog = (book = null) => {
        if (book) {
            setEditingBook(book);
            setPreviewUrl(book.poster || '');
            formik.setValues({
                title: book.title || '',
                author: book.author || '',
                price: book.price || 0,
                desc: book.desc || '',
                category: book.category?.name || '',
                stock: book.stock || 0,
                dateRealisation: book.dateRealisation 
                    ? new Date(book.dateRealisation).toISOString().split('T')[0] 
                    : new Date().toISOString().split('T')[0],
                poster: ''  // On ne copie pas l'URL de l'image existante
            });
        } else {
            setEditingBook(null);
            setPreviewUrl('');
            formik.resetForm();
            formik.setValues({
                title: '',
                author: '',
                price: 0,
                desc: '',
                category: '',
                stock: 0,
                dateRealisation: new Date().toISOString().split('T')[0],
                poster: ''
            });
        }
        setSelectedFile(null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingBook(null);
        setSelectedFile(null);
        setPreviewUrl('');
        formik.resetForm();
    };    const handleDelete = async (book) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
            try {
                const result = await bookService.deleteBook(book._id);
                if (result.success) {
                    toast.success('Livre supprimé avec succès');
                    loadBooks();
                } else {
                    toast.error(result.message || 'Échec de la suppression');
                }
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                const errorMessage = error.response?.data?.message || error.message || 'Échec de la suppression';
                toast.error(errorMessage);
            }
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Box sx={{ bgcolor: '#f6f8fa', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Gestion des Livres
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{
                            bgcolor: '#00b8d9',
                            borderRadius: 2,
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(0,184,217,0.07)',
                            '&:hover': { bgcolor: '#0097b2' }
                        }}
                    >
                        Ajouter un Livre
                    </Button>
                </Box>

                <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(60,60,60,0.07)' }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow sx={{ background: '#f3f5f7' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Titre</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Auteur</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Catégorie</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">Prix</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">Stock</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">Date de Publication</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {books.map((book) => (
                                    <TableRow key={book._id} hover>
                                        <TableCell>{book.title}</TableCell>
                                        <TableCell>{book.author}</TableCell>
                                        <TableCell>{book.category?.name}</TableCell>
                                        <TableCell align="right">{book.price.toFixed(2)} €</TableCell>
                                        <TableCell align="right">{book.stock}</TableCell>
                                        <TableCell align="right">
                                            {new Date(book.dateRealisation).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton color="primary" onClick={() => handleOpenDialog(book)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(book)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <form onSubmit={formik.handleSubmit}>
                        <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>
                            {editingBook ? 'Modifier le Livre' : 'Ajouter un Nouveau Livre'}
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
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
                                        name="author"
                                        label="Auteur"
                                        value={formik.values.author}
                                        onChange={formik.handleChange}
                                        error={formik.touched.author && Boolean(formik.errors.author)}
                                        helperText={formik.touched.author && formik.errors.author}
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
                                </Grid>                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Catégorie</InputLabel>
                                        <Select
                                            name="category"
                                            value={formik.values.category}
                                            label="Catégorie"
                                            onChange={formik.handleChange}
                                            error={formik.touched.category && Boolean(formik.errors.category)}
                                        >
                                            {categories.map((cat) => (
                                                <MenuItem key={cat._id} value={cat.name}>
                                                    {cat.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
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
                                </Grid>                                <Grid item xs={12}>
                                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                                        {(previewUrl || editingBook?.poster) && (
                                            <Box
                                                component="img"
                                                src={previewUrl || editingBook?.poster}
                                                alt="Preview"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/default-book.jpg';
                                                }}
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
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog}>Annuler</Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={formik.isSubmitting}
                                sx={{ borderRadius: 2, fontWeight: 600 }}
                            >
                                {editingBook ? 'Mettre à jour' : 'Créer'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Container>
        </Box>
    );
};

export default ManageBooks;
