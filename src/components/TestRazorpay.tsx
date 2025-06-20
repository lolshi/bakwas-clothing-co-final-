import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

declare global {
    interface Window {
        Razorpay: any;
    }
}

const TestRazorpay = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<any | null>(null);

    const testEnvironment = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8082/test-env');
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to test environment');
        } finally {
            setLoading(false);
        }
    };

    const testRazorpayOrder = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8082/test-razorpay');
            const data = await response.json();
            setResult(data);

            if (data.success && data.order) {
                // Initialize Razorpay payment
                const options = {
                    key: 'rzp_test_DBH2YNOgZiNag2', // Your Razorpay Key ID
                    amount: data.order.amount,
                    currency: data.order.currency,
                    name: 'Bakwas Test Order',
                    description: 'Test Transaction',
                    order_id: data.order.id,
                    handler: function (response: any) {
                        setResult({
                            ...data,
                            payment_response: response
                        });
                    },
                    prefill: {
                        name: 'Test User',
                        email: 'test@example.com',
                        contact: '9999999999'
                    },
                    theme: {
                        color: '#3399cc'
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create test order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 max-w-2xl mx-auto my-8">
            <h2 className="text-2xl font-bold mb-4">Razorpay Integration Tests</h2>
            
            <div className="space-y-4">
                <div>
                    <Button 
                        onClick={testEnvironment}
                        disabled={loading}
                        variant="outline"
                        className="mr-4"
                    >
                        Test Environment
                    </Button>

                    <Button 
                        onClick={testRazorpayOrder}
                        disabled={loading}
                        variant="default"
                    >
                        Create Test Order
                    </Button>
                </div>

                {loading && (
                    <p className="text-gray-500">Loading...</p>
                )}

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-md">
                        Error: {error}
                    </div>
                )}

                {result && (
                    <div className="p-4 bg-gray-50 rounded-md">
                        <pre className="whitespace-pre-wrap">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default TestRazorpay; 