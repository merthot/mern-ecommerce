import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import AdminRoute from './components/routes/AdminRoute';
import PrivateRoute from './components/routes/PrivateRoute';
import Products from './pages/admin/Products';
import CategoryProducts from './pages/CategoryProducts';
import Dashboard from './pages/admin/Dashboard';
import NewProduct from './pages/admin/NewProduct';
import EditProduct from './pages/admin/EditProduct';
import Orders from './pages/admin/Orders';
import Discounts from './pages/admin/Discounts';
import Search from './pages/Search';
import Shipping from './pages/Shipping';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';
import OrderDetails from './pages/OrderDetails';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Kategori Sayfaları */}
            <Route path="/:category/:subcategory/:type" element={<CategoryProducts />} />
            <Route path="/:category/:subcategory" element={<CategoryProducts />} />
            <Route path="/:category" element={<CategoryProducts />} />

            {/* Korumalı Rotalar */}
            <Route path="" element={<PrivateRoute />}>
              <Route path="/account/*" element={<Account />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/order/:id" element={<OrderDetails />} />
            </Route>

            {/* Admin Rotaları */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/new" element={<NewProduct />} />
              <Route path="products/:id/edit" element={<EditProduct />} />
              <Route path="orders" element={<Orders />} />
              <Route path="discounts" element={<Discounts />} />
            </Route>

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <ToastContainer />
    </Router>
  );
};

export default App;
