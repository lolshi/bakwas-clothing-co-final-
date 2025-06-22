import '@/styles/globals.css';
import '@/styles/scrollbar.css';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import GlobalLayout from "./components/GlobalLayout";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Checkout from "./pages/Checkout";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import ReturnsPolicy from "./pages/ReturnsPolicy";
import OrderHistory from "./pages/OrderHistory";
import FAQs from "./pages/FAQs";
import MyAccount from "./pages/MyAccount";
import Company from "./pages/Company";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import Wishlist from "./pages/Wishlist";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminHomepage from "./pages/AdminHomepage";
import AdminPromoCodes from "./pages/AdminPromoCodes";
import AdminContent from "./pages/AdminContent";
import AdminBlog from "./pages/AdminBlog";
import AdminPaymentSettings from "./pages/AdminPaymentSettings";
import AdminCreateOrder from "./pages/AdminCreateOrder";
import AdminContactMessages from "./pages/AdminContactMessages";
import CardVariantsDemo from "./pages/CardVariantsDemo";
import NotFound from "./pages/NotFound";
import OrderSuccess from "./pages/OrderSuccess";
import TrackOrder from "./pages/TrackOrder";
import SupabaseConnectionTest from "./components/SupabaseConnectionTest";
import AdminSetup from "./pages/AdminSetup";
import ReturnRequest from "./pages/ReturnRequest";
import AdminReturns from "./pages/AdminReturns";
import AdminWallets from "./pages/AdminWallets";
import FilterTest from './pages/FilterTest';
import MobileProductViewTest from './pages/MobileProductViewTest';
import MobileProductDetailTest from './pages/MobileProductDetailTest';
import MobileProductDetailTestEnhanced from './pages/MobileProductDetailTestEnhanced';
import ShopTest from "./pages/ShopTest";
import TestRazorpay from "./components/TestRazorpay";
import Payment from './pages/Payment';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <CartProvider>
            <WishlistProvider>
              <TooltipProvider delayDuration={300}>
                <div className="min-h-screen">
                  <Routes>
                    {/* Public routes wrapped with GlobalLayout */}
                    <Route element={<GlobalLayout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/payment/:orderNumber" element={<Payment />} />
                      <Route path="/payment" element={<Payment />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/returns-policy" element={<ReturnsPolicy />} />
                      <Route path="/order-history" element={<OrderHistory />} />
                      <Route path="/orders" element={<OrderHistory />} />
                      <Route path="/faqs" element={<FAQs />} />
                      <Route path="/account" element={<MyAccount />} />
                      <Route path="/company" element={<Company />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/blogs" element={<Blogs />} />
                      <Route path="/blogs/:slug" element={<BlogDetail />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/card-variants-demo" element={<CardVariantsDemo />} />
                      <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                      <Route path="/track-order/:orderNumber" element={<TrackOrder />} />
                      <Route path="/db-test" element={<SupabaseConnectionTest />} />
                      <Route path="/admin-setup" element={<AdminSetup />} />
                      <Route path="/return-request/:orderId" element={<ReturnRequest />} />
                      <Route path="/filter-test" element={<FilterTest />} />
                      <Route path="/mobile-product-view-test" element={<MobileProductViewTest />} />
                      <Route path="/mobile-product-detail-test/:productId" element={<MobileProductDetailTest />} />
                      <Route path="/mobile-product-detail-test-enhanced/:productId" element={<MobileProductDetailTestEnhanced />} />
                      <Route path="/ShopTest" element={<ShopTest />} />
                      <Route path="/test-razorpay" element={<TestRazorpay />} />
                    </Route>
                    
                    {/* Admin Routes - separate from GlobalLayout */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={
                      <ProtectedAdminRoute>
                        <AdminDashboard />
                      </ProtectedAdminRoute>
                    } />
                    <Route path="/admin/products" element={
                      <ProtectedAdminRoute>
                        <AdminProducts />
                      </ProtectedAdminRoute>
                    } />
                    <Route path="/admin/orders" element={
                      <ProtectedAdminRoute>
                        <AdminOrders />
                      </ProtectedAdminRoute>
                    } />
                    <Route path="/admin/returns" element={
                      <ProtectedAdminRoute>
                        <AdminReturns />
                      </ProtectedAdminRoute>
                    } />
                    <Route path="/admin/create-order" element={
                      <ProtectedAdminRoute>
                        <AdminCreateOrder />
                      </ProtectedAdminRoute>
                    } />
                    <Route path="/admin/homepage" element={
                      <ProtectedAdminRoute>
                        <AdminHomepage />
                      </ProtectedAdminRoute>
                    } />
                    <Route path="/admin/promo-codes" element={
                      <ProtectedAdminRoute>
                        <AdminPromoCodes />
                      </ProtectedAdminRoute>
                    } />
                    <Route path="/admin/content" element={
                      <ProtectedAdminRoute>
                        <AdminContent />
                      </ProtectedAdminRoute>
                    } />
                    <Route path="/admin/blog" element={
                      <ProtectedAdminRoute>
                        <AdminBlog />
                      </ProtectedAdminRoute>
                    } />
                    <Route path="/admin/payments" element={
                      <ProtectedAdminRoute>
                        <AdminPaymentSettings />
                      </ProtectedAdminRoute>
                    } />
                    <Route path="/admin/contact-messages" element={
                      <ProtectedAdminRoute>
                        <AdminContactMessages />
                      </ProtectedAdminRoute>
                    } />
                    <Route path="/admin/wallets" element={
                      <ProtectedAdminRoute>
                        <AdminWallets />
                      </ProtectedAdminRoute>
                    } />
                    
                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </WishlistProvider>
          </CartProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
