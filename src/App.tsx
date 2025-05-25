
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
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Checkout from "./pages/Checkout";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import ReturnsPolicy from "./pages/ReturnsPolicy";
import OrderHistory from "./pages/OrderHistory";
import ReturnRequest from "./pages/ReturnRequest";
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
import NotFound from "./pages/NotFound";

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
                    <Route path="/" element={<Index />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/checkout" element={<Checkout />} />
                    
                    {/* New Content Pages */}
                    <Route path="/help" element={<Help />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/returns-policy" element={<ReturnsPolicy />} />
                    <Route path="/order-history" element={<OrderHistory />} />
                    <Route path="/return-request" element={<ReturnRequest />} />
                    <Route path="/faqs" element={<FAQs />} />
                    <Route path="/account" element={<MyAccount />} />
                    <Route path="/company" element={<Company />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/blogs/:slug" element={<BlogDetail />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    
                    {/* Admin Routes */}
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
                    
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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
