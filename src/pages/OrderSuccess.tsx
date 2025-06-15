import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, CreditCard, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderSuccess = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [orderDetails, setOrderDetails] = useState({
    orderNumber: orderId || '',
    estimatedDelivery: '5-7 business days',
    trackingNumber: `TRK${Date.now().toString().slice(-8)}`,
  });

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div 
      className="min-h-screen bg-background relative flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/lovable-uploads/dd9a56c9-3774-432e-930e-da9a0dbac0f3.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div 
          className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-anton text-white mb-2">
              Order Confirmed!
            </h1>
            <p className="text-xl text-gray-300 font-space">
              Thank you for your purchase
            </p>
          </motion.div>

          {/* Order Details */}
          <motion.div 
            className="bg-white/10 rounded-2xl p-6 mb-8 text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-space text-white mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Order Number:</span>
                <span className="text-cyan-400 font-semibold">{orderDetails.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Estimated Delivery:</span>
                <span className="text-white">{orderDetails.estimatedDelivery}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Tracking Number:</span>
                <span className="text-cyan-400 font-semibold">{orderDetails.trackingNumber}</span>
              </div>
            </div>
          </motion.div>

          {/* Status Steps */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-space text-white mb-4">What's Next?</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-left">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-white font-semibold">Order Confirmed</p>
                  <p className="text-gray-400 text-sm">We've received your order</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-left">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-white font-semibold">Processing</p>
                  <p className="text-gray-400 text-sm">We're preparing your items</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-left">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-300 font-semibold">Shipped</p>
                  <p className="text-gray-400 text-sm">Your order is on its way</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link 
              to="/order-history"
              className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 inline-block"
            >
              View Order History
            </Link>
            
            <Link 
              to="/shop"
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 inline-block border border-white/20"
            >
              Continue Shopping
            </Link>
            
            <Link 
              to="/"
              className="w-full bg-transparent hover:bg-white/5 text-gray-300 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all inline-flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            className="mt-8 pt-6 border-t border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-gray-400 text-sm">
              Questions about your order? 
              <Link to="/contact" className="text-cyan-400 hover:text-cyan-300 ml-1">
                Contact us
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess; 