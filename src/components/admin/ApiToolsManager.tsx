import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CreditCard,
  Truck,
  Mail,
  BarChart3,
  Share2,
  Package,
  MessageSquare,
  Shield,
  Camera,
  Search,
  Star,
  Cloud,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Key,
  Globe,
  Smartphone,
  Eye,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Download,
  Upload,
  Activity,
  Lock,
  Unlock,
  Bot,
  Users,
  TrendingUp,
  FileText,
  Bell,
  Target,
  Palette,
  Code,
  Webhook,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiIntegration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  apiKey?: string;
  isEnabled: boolean;
  lastSync?: string;
  usageLimit?: string;
  currentUsage?: number;
  features: string[];
  pricing: string;
  documentation: string;
  webhookUrl?: string;
  testEndpoint?: string;
}

const ApiToolsManager: React.FC = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingApi, setEditingApi] = useState<string | null>(null);

  const [integrations, setIntegrations] = useState<ApiIntegration[]>([
    // Payment Gateways
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Accept payments online with Stripe\'s powerful and flexible payment platform',
      category: 'payment',
      icon: <CreditCard className="h-6 w-6" />,
      status: 'connected',
      apiKey: 'sk_test_***************************',
      isEnabled: true,
      lastSync: '2024-01-20T10:30:00Z',
      usageLimit: '10,000 transactions/month',
      currentUsage: 2847,
      features: ['Credit Cards', 'Digital Wallets', 'International Payments', 'Webhooks'],
      pricing: '2.9% + ₹2 per transaction',
      documentation: 'https://stripe.com/docs'
    },
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'India\'s most trusted payment gateway for UPI, cards, wallets & more',
      category: 'payment',
      icon: <CreditCard className="h-6 w-6" />,
      status: 'connected',
      apiKey: 'rzp_test_***************************',
      isEnabled: true,
      lastSync: '2024-01-20T09:15:00Z',
      usageLimit: 'Unlimited',
      currentUsage: 1543,
      features: ['UPI', 'Cards', 'Net Banking', 'Wallets', 'EMI'],
      pricing: '2% per transaction',
      documentation: 'https://razorpay.com/docs'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Global payment processing for international customers',
      category: 'payment',
      icon: <CreditCard className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['International Payments', 'PayPal Wallet', 'Express Checkout'],
      pricing: '3.49% + ₹2.49 per transaction',
      documentation: 'https://developer.paypal.com'
    },

    // Shipping & Logistics
    {
      id: 'shiprocket',
      name: 'Shiprocket',
      description: 'Complete shipping solution with 17+ courier partners',
      category: 'shipping',
      icon: <Truck className="h-6 w-6" />,
      status: 'connected',
      apiKey: 'sr_***************************',
      isEnabled: true,
      lastSync: '2024-01-20T11:45:00Z',
      usageLimit: '1000 shipments/month',
      currentUsage: 234,
      features: ['17+ Courier Partners', 'Real-time Tracking', 'COD Available', 'Return Management'],
      pricing: 'Starting from ₹25 per shipment',
      documentation: 'https://apidocs.shiprocket.in'
    },
    {
      id: 'delhivery',
      name: 'Delhivery',
      description: 'End-to-end logistics and supply chain solutions',
      category: 'shipping',
      icon: <Truck className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Pan-India Delivery', 'Same Day Delivery', 'Warehousing', 'International'],
      pricing: 'Dynamic pricing based on weight and distance',
      documentation: 'https://www.delhivery.com/api'
    },
    {
      id: 'bluedart',
      name: 'Blue Dart',
      description: 'Premium express delivery and logistics services',
      category: 'shipping',
      icon: <Truck className="h-6 w-6" />,
      status: 'testing',
      isEnabled: false,
      features: ['Express Delivery', 'Time Definite', 'International', 'Cash on Delivery'],
      pricing: 'Premium pricing for express delivery',
      documentation: 'https://www.bluedart.com/api'
    },

    // Email & Communication
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email marketing automation and customer engagement platform',
      category: 'communication',
      icon: <Mail className="h-6 w-6" />,
      status: 'connected',
      apiKey: 'mc_***************************',
      isEnabled: true,
      lastSync: '2024-01-20T08:30:00Z',
      usageLimit: '2000 emails/month',
      currentUsage: 1456,
      features: ['Email Campaigns', 'Automation', 'Analytics', 'A/B Testing'],
      pricing: 'Free up to 2000 contacts',
      documentation: 'https://mailchimp.com/developer'
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'Reliable email delivery at scale with powerful APIs',
      category: 'communication',
      icon: <Mail className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Transactional Emails', 'Marketing Campaigns', 'Email Validation'],
      pricing: 'Free 100 emails/day, then paid plans',
      documentation: 'https://docs.sendgrid.com'
    },
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'SMS, voice, and WhatsApp messaging platform',
      category: 'communication',
      icon: <Smartphone className="h-6 w-6" />,
      status: 'connected',
      apiKey: 'AC***************************',
      isEnabled: true,
      lastSync: '2024-01-20T12:00:00Z',
      usageLimit: '1000 SMS/month',
      currentUsage: 567,
      features: ['SMS', 'Voice Calls', 'WhatsApp API', 'Verify API'],
      pricing: '₹0.60 per SMS in India',
      documentation: 'https://www.twilio.com/docs'
    },

    // Analytics & Tracking
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Web analytics and customer insights platform',
      category: 'analytics',
      icon: <BarChart3 className="h-6 w-6" />,
      status: 'connected',
      apiKey: 'GA_MEASUREMENT_ID',
      isEnabled: true,
      lastSync: '2024-01-20T13:15:00Z',
      usageLimit: 'Unlimited',
      currentUsage: 0,
      features: ['Traffic Analysis', 'E-commerce Tracking', 'Custom Events', 'Audience Insights'],
      pricing: 'Free',
      documentation: 'https://developers.google.com/analytics'
    },
    {
      id: 'facebook-pixel',
      name: 'Facebook Pixel',
      description: 'Track website visitors and optimize Facebook ad campaigns',
      category: 'analytics',
      icon: <Target className="h-6 w-6" />,
      status: 'connected',
      apiKey: '123456789012345',
      isEnabled: true,
      lastSync: '2024-01-20T13:10:00Z',
      usageLimit: 'Unlimited',
      currentUsage: 0,
      features: ['Conversion Tracking', 'Custom Audiences', 'Lookalike Audiences', 'Attribution'],
      pricing: 'Free',
      documentation: 'https://developers.facebook.com/docs/facebook-pixel'
    },
    {
      id: 'hotjar',
      name: 'Hotjar',
      description: 'User behavior analytics with heatmaps and session recordings',
      category: 'analytics',
      icon: <Eye className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Heatmaps', 'Session Recordings', 'Feedback Polls', 'Conversion Funnels'],
      pricing: 'Free up to 35 sessions/day',
      documentation: 'https://help.hotjar.com'
    },

    // Social Media
    {
      id: 'instagram-api',
      name: 'Instagram API',
      description: 'Integrate Instagram content and manage business profile',
      category: 'social',
      icon: <Share2 className="h-6 w-6" />,
      status: 'connected',
      apiKey: 'IG_***************************',
      isEnabled: true,
      lastSync: '2024-01-20T14:20:00Z',
      usageLimit: '200 API calls/hour',
      currentUsage: 45,
      features: ['Post Content', 'Stories', 'Profile Management', 'Insights'],
      pricing: 'Free with Facebook Developer Account',
      documentation: 'https://developers.facebook.com/docs/instagram-api'
    },
    {
      id: 'whatsapp-business',
      name: 'WhatsApp Business',
      description: 'Send order updates and customer support via WhatsApp',
      category: 'social',
      icon: <MessageSquare className="h-6 w-6" />,
      status: 'testing',
      isEnabled: false,
      features: ['Order Notifications', 'Customer Support', 'Catalog Sharing', 'Template Messages'],
      pricing: 'Pay per conversation',
      documentation: 'https://developers.facebook.com/docs/whatsapp'
    },

    // Customer Support
    {
      id: 'zendesk',
      name: 'Zendesk',
      description: 'Complete customer service and support ticket management',
      category: 'support',
      icon: <MessageSquare className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Ticket Management', 'Live Chat', 'Knowledge Base', 'Customer Portal'],
      pricing: 'Starting from $19/agent/month',
      documentation: 'https://developer.zendesk.com'
    },
    {
      id: 'intercom',
      name: 'Intercom',
      description: 'Modern customer messaging and engagement platform',
      category: 'support',
      icon: <Users className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Live Chat', 'Automated Messages', 'Customer Data', 'Product Tours'],
      pricing: 'Starting from $39/month',
      documentation: 'https://developers.intercom.com'
    },

    // Security & Protection
    {
      id: 'recaptcha',
      name: 'reCAPTCHA',
      description: 'Protect your website from spam and abuse',
      category: 'security',
      icon: <Shield className="h-6 w-6" />,
      status: 'connected',
      apiKey: '6L***************************',
      isEnabled: true,
      lastSync: '2024-01-20T15:00:00Z',
      usageLimit: '1,000,000 verifications/month',
      currentUsage: 2341,
      features: ['Bot Protection', 'Spam Prevention', 'Risk Analysis', 'Invisible Mode'],
      pricing: 'Free',
      documentation: 'https://developers.google.com/recaptcha'
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare',
      description: 'Web security, performance, and reliability platform',
      category: 'security',
      icon: <Cloud className="h-6 w-6" />,
      status: 'connected',
      apiKey: 'cf_***************************',
      isEnabled: true,
      lastSync: '2024-01-20T15:30:00Z',
      usageLimit: 'Unlimited',
      currentUsage: 0,
      features: ['CDN', 'DDoS Protection', 'SSL/TLS', 'Web Application Firewall'],
      pricing: 'Free plan available',
      documentation: 'https://api.cloudflare.com'
    },

    // Media & Assets
    {
      id: 'cloudinary',
      name: 'Cloudinary',
      description: 'Cloud-based image and video management platform',
      category: 'media',
      icon: <Camera className="h-6 w-6" />,
      status: 'connected',
      apiKey: 'cl_***************************',
      isEnabled: true,
      lastSync: '2024-01-20T16:00:00Z',
      usageLimit: '25GB storage, 25GB bandwidth/month',
      currentUsage: 15.7,
      features: ['Image Optimization', 'Video Management', 'AI Transformations', 'CDN Delivery'],
      pricing: 'Free up to 25GB, then paid plans',
      documentation: 'https://cloudinary.com/documentation'
    },
    {
      id: 'aws-s3',
      name: 'AWS S3',
      description: 'Scalable cloud storage for static assets and backups',
      category: 'media',
      icon: <Cloud className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Object Storage', 'Static Website Hosting', 'Data Backup', 'Content Delivery'],
      pricing: '$0.023 per GB stored per month',
      documentation: 'https://docs.aws.amazon.com/s3'
    },

    // Reviews & Ratings
    {
      id: 'trustpilot',
      name: 'Trustpilot',
      description: 'Customer review platform for building trust and credibility',
      category: 'reviews',
      icon: <Star className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Review Collection', 'Review Display', 'Business Analytics', 'Review Invitations'],
      pricing: 'Free plan available, premium features paid',
      documentation: 'https://documentation-apidocumentation.trustpilot.com'
    },
    {
      id: 'google-reviews',
      name: 'Google Reviews',
      description: 'Integrate Google Business reviews and ratings',
      category: 'reviews',
      icon: <Star className="h-6 w-6" />,
      status: 'connected',
      apiKey: 'GMB_***************************',
      isEnabled: true,
      lastSync: '2024-01-20T17:00:00Z',
      usageLimit: '1000 API calls/day',
      currentUsage: 23,
      features: ['Review Display', 'Rating Aggregation', 'Business Insights', 'Review Responses'],
      pricing: 'Free',
      documentation: 'https://developers.google.com/my-business'
    },

    // AI & Automation
    {
      id: 'openai',
      name: 'OpenAI GPT',
      description: 'AI-powered content generation and customer support',
      category: 'ai',
      icon: <Bot className="h-6 w-6" />,
      status: 'connected',
      apiKey: 'sk-***************************',
      isEnabled: true,
      lastSync: '2024-01-20T18:00:00Z',
      usageLimit: '$100 credit/month',
      currentUsage: 67.50,
      features: ['Content Generation', 'Product Descriptions', 'Customer Support', 'Translation'],
      pricing: 'Pay per token usage',
      documentation: 'https://platform.openai.com/docs'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automation workflows between different apps and services',
      category: 'automation',
      icon: <Zap className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Workflow Automation', '5000+ App Integrations', 'Trigger Events', 'Multi-step Zaps'],
      pricing: 'Free up to 100 tasks/month',
      documentation: 'https://zapier.com/developer'
    },

    // Additional E-commerce Tools
    {
      id: 'klaviyo',
      name: 'Klaviyo',
      description: 'Advanced email marketing and customer data platform',
      category: 'communication',
      icon: <Mail className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Email Automation', 'SMS Marketing', 'Customer Segmentation', 'Advanced Analytics'],
      pricing: 'Free up to 250 contacts',
      documentation: 'https://developers.klaviyo.com'
    },
    {
      id: 'shopify-api',
      name: 'Shopify API',
      description: 'Sync products and orders with Shopify platform',
      category: 'ecommerce',
      icon: <Package className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Product Sync', 'Order Management', 'Inventory Sync', 'Multi-channel Selling'],
      pricing: 'Platform fee applies',
      documentation: 'https://shopify.dev/api'
    },
    {
      id: 'google-merchant',
      name: 'Google Merchant Center',
      description: 'List products on Google Shopping and Google Ads',
      category: 'marketing',
      icon: <Search className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Product Listings', 'Shopping Ads', 'Performance Reporting', 'Free Listings'],
      pricing: 'Free listings, pay per click for ads',
      documentation: 'https://developers.google.com/shopping-content'
    },
    {
      id: 'facebook-catalog',
      name: 'Facebook Catalog',
      description: 'Showcase products on Facebook and Instagram',
      category: 'social',
      icon: <Share2 className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Product Catalog', 'Dynamic Ads', 'Instagram Shopping', 'Messenger Commerce'],
      pricing: 'Free setup, pay for advertising',
      documentation: 'https://developers.facebook.com/docs/marketing-api/catalog'
    },
    {
      id: 'gst-api',
      name: 'GST India API',
      description: 'Automated GST calculations and compliance for Indian business',
      category: 'finance',
      icon: <FileText className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['GST Calculation', 'Invoice Generation', 'Tax Compliance', 'Returns Filing'],
      pricing: 'Subscription based',
      documentation: 'https://gst.gov.in/developer'
    },
    {
      id: 'razorpay-x',
      name: 'RazorpayX',
      description: 'Business banking and financial operations platform',
      category: 'finance',
      icon: <DollarSign className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Business Account', 'Automated Payouts', 'Expense Management', 'Tax Payments'],
      pricing: 'No setup fee, transaction-based pricing',
      documentation: 'https://razorpay.com/docs/razorpayx'
    },
    {
      id: 'clevertap',
      name: 'CleverTap',
      description: 'Customer engagement and retention platform',
      category: 'analytics',
      icon: <Users className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['User Analytics', 'Push Notifications', 'In-app Messaging', 'A/B Testing'],
      pricing: 'Free up to 1M user profiles',
      documentation: 'https://developer.clevertap.com'
    },
    {
      id: 'mixpanel',
      name: 'Mixpanel',
      description: 'Advanced product analytics and user behavior tracking',
      category: 'analytics',
      icon: <BarChart3 className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Event Tracking', 'Funnel Analysis', 'Cohort Analysis', 'A/B Testing'],
      pricing: 'Free up to 100K monthly tracked users',
      documentation: 'https://developer.mixpanel.com'
    },
    {
      id: 'firebase',
      name: 'Firebase',
      description: 'Google\'s mobile and web application development platform',
      category: 'development',
      icon: <Code className="h-6 w-6" />,
      status: 'connected',
      apiKey: 'firebase_***************************',
      isEnabled: true,
      lastSync: '2024-01-20T19:00:00Z',
      usageLimit: 'Generous free tier',
      currentUsage: 0,
      features: ['Push Notifications', 'Analytics', 'Crashlytics', 'Remote Config'],
      pricing: 'Free tier available, usage-based pricing',
      documentation: 'https://firebase.google.com/docs'
    },
    {
      id: 'sentry',
      name: 'Sentry',
      description: 'Application monitoring and error tracking platform',
      category: 'development',
      icon: <AlertTriangle className="h-6 w-6" />,
      status: 'disconnected',
      isEnabled: false,
      features: ['Error Tracking', 'Performance Monitoring', 'Release Health', 'Alerting'],
      pricing: 'Free up to 5K errors/month',
      documentation: 'https://docs.sentry.io'
    },
    {
      id: 'webhooks',
      name: 'Custom Webhooks',
      description: 'Configure custom webhook endpoints for real-time notifications',
      category: 'development',
      icon: <Webhook className="h-6 w-6" />,
      status: 'connected',
      isEnabled: true,
      features: ['Order Notifications', 'Payment Updates', 'Inventory Changes', 'User Events'],
      pricing: 'Free - Built-in feature',
      documentation: '/docs/webhooks'
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Tools', icon: <Globe className="h-4 w-4" /> },
    { id: 'payment', name: 'Payment Gateways', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'shipping', name: 'Shipping & Logistics', icon: <Truck className="h-4 w-4" /> },
    { id: 'communication', name: 'Email & SMS', icon: <Mail className="h-4 w-4" /> },
    { id: 'analytics', name: 'Analytics & Tracking', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'social', name: 'Social Media', icon: <Share2 className="h-4 w-4" /> },
    { id: 'support', name: 'Customer Support', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'security', name: 'Security & Protection', icon: <Shield className="h-4 w-4" /> },
    { id: 'media', name: 'Media & Assets', icon: <Camera className="h-4 w-4" /> },
    { id: 'reviews', name: 'Reviews & Ratings', icon: <Star className="h-4 w-4" /> },
    { id: 'ai', name: 'AI & Automation', icon: <Bot className="h-4 w-4" /> },
    { id: 'automation', name: 'Workflow Automation', icon: <Zap className="h-4 w-4" /> },
    { id: 'ecommerce', name: 'E-commerce Platforms', icon: <Package className="h-4 w-4" /> },
    { id: 'marketing', name: 'Marketing & SEO', icon: <Target className="h-4 w-4" /> },
    { id: 'finance', name: 'Finance & Accounting', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'development', name: 'Development Tools', icon: <Code className="h-4 w-4" /> }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'testing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Testing</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, isEnabled: !integration.isEnabled }
        : integration
    ));
    
    const integration = integrations.find(i => i.id === id);
    toast({
      title: integration?.isEnabled ? "Integration Disabled" : "Integration Enabled",
      description: `${integration?.name} has been ${integration?.isEnabled ? 'disabled' : 'enabled'}.`,
    });
  };

  const handleTestConnection = (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, status: 'testing' }
        : integration
    ));

    // Simulate test
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === id 
          ? { ...integration, status: 'connected' }
          : integration
      ));
      
      const integration = integrations.find(i => i.id === id);
      toast({
        title: "Connection Test Successful",
        description: `${integration?.name} is working correctly.`,
      });
    }, 2000);
  };

  const handleSaveApiKey = (id: string, apiKey: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, apiKey, status: 'connected' }
        : integration
    ));
    
    setEditingApi(null);
    toast({
      title: "API Key Saved",
      description: "The API key has been saved successfully.",
    });
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const enabledCount = integrations.filter(i => i.isEnabled).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Integrations</p>
                <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">{enabledCount}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-purple-600">{categories.length - 1}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        {category.icon}
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Config
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Config
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {integration.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(integration.status)}
                      {getStatusBadge(integration.status)}
                    </div>
                  </div>
                </div>
                
                <Switch
                  checked={integration.isEnabled}
                  onCheckedChange={() => handleToggleIntegration(integration.id)}
                  disabled={integration.status !== 'connected'}
                />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <CardDescription className="text-sm">
                {integration.description}
              </CardDescription>

              {/* Features */}
              <div>
                <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Features</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {integration.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {integration.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{integration.features.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Pricing</Label>
                <p className="text-sm text-gray-700 mt-1">{integration.pricing}</p>
              </div>

              {/* Usage Stats */}
              {integration.status === 'connected' && integration.currentUsage !== undefined && (
                <div>
                  <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Usage</Label>
                  <div className="mt-1">
                    {integration.usageLimit?.includes('GB') ? (
                      <p className="text-sm text-gray-700">
                        {integration.currentUsage} GB used of {integration.usageLimit}
                      </p>
                    ) : integration.usageLimit?.includes('$') ? (
                      <p className="text-sm text-gray-700">
                        ${integration.currentUsage} used of {integration.usageLimit}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-700">
                        {integration.currentUsage?.toLocaleString()} used of {integration.usageLimit}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* API Key Management */}
              {editingApi === integration.id ? (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter API key..."
                      defaultValue={integration.apiKey}
                      type="password"
                      className="text-xs"
                    />
                    <Button size="sm" onClick={() => handleSaveApiKey(integration.id, 'new-api-key')}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingApi(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : integration.apiKey && (
                <div>
                  <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">API Key</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                      {integration.apiKey}
                    </code>
                    <Button size="sm" variant="ghost" onClick={() => setEditingApi(integration.id)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {integration.status === 'connected' ? (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleTestConnection(integration.id)}
                    className="flex-1"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => setEditingApi(integration.id)}
                    className="flex-1"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Connect
                  </Button>
                )}
                
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Docs
                </Button>
                
                <Button size="sm" variant="ghost">
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
            <p className="text-gray-600">
              Try adjusting your search or category filter to find the integration you're looking for.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiToolsManager; 