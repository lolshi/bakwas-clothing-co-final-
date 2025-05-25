
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, X } from 'lucide-react';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call to /api/contact
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowModal(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/public/bg-contact.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-4">
        {/* Logo Header */}
        <div className="text-center py-8">
          <img 
            src="/lovable-uploads/97535d1c-cb3e-4d54-ab8b-54078a7ca53c.png" 
            alt="Bakwas Clothing Co." 
            className="w-48 h-auto mx-auto mb-4"
          />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="bg-black/70 backdrop-blur-sm border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Send us a message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-gray-800 text-white border-gray-600"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-gray-800 text-white border-gray-600"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-white">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-gray-800 text-white border-gray-600"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-white">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="bg-gray-800 text-white border-gray-600"
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-white">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="bg-gray-800 text-white border-gray-600"
                      placeholder="Tell us more about your inquiry..."
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-blue-400 hover:bg-blue-500 text-black font-semibold"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="bg-black/70 backdrop-blur-sm border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Get in touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-white">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <span>support@bakwasclothingco.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <Phone className="h-5 w-5 text-blue-400" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-start gap-3 text-white">
                    <MapPin className="h-5 w-5 text-blue-400 mt-1" />
                    <span>RZG/634-B Lohia Marg, New Delhi 110077</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/70 backdrop-blur-sm border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Business Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-white">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold text-center mb-4">Thanks!</h2>
            <p className="text-center text-gray-600">
              We'll connect with you soon.
            </p>
            <Button 
              onClick={() => setShowModal(false)}
              className="w-full mt-6 bg-blue-400 hover:bg-blue-500 text-black"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
