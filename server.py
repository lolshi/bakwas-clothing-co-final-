from flask import Flask, request, jsonify
from flask_cors import CORS
import razorpay
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Razorpay client
client = razorpay.Client(
    auth=(
        os.getenv('RAZORPAY_KEY_ID', 'your_key_id_here'),
        os.getenv('RAZORPAY_KEY_SECRET', 'your_key_secret_here')
    )
)

@app.route('/api/create-razorpay-order', methods=['POST'])
def create_order():
    try:
        data = request.json
        amount = data.get('amount')
        currency = data.get('currency', 'INR')
        receipt = data.get('receipt')

        if not amount:
            return jsonify({'error': 'Amount is required'}), 400

        # Create Razorpay Order
        order_data = {
            'amount': amount,
            'currency': currency,
            'receipt': receipt,
            'payment_capture': 1  # Auto capture payment
        }
        
        order = client.order.create(data=order_data)
        return jsonify(order)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
