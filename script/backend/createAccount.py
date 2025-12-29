from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

USERS_DIR = os.path.join(os.path.dirname(__file__), '../../users')

@app.route('/api/create-account', methods=['POST'])
def create_account():
    data = request.json
    username = data.get('username')
    password = data.get('password') # Password arriving here should already be hashed.

    if not username or not password:
        return jsonify({'success': False, 'error': 'Username and password required'}), 400

    user_dir = os.path.join(USERS_DIR, username)
    user_file = os.path.join(user_dir, 'user.json')

    if os.path.exists(user_file):
        return jsonify({'success': False, 'error': 'User already exists'}), 409

    os.makedirs(user_dir, exist_ok=True)
    # password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    user_data = {
        'username': username,
        'passwordHash': password
    }

    with open(user_file, 'w') as f:
        json.dump(user_data, f)

    if(username == "test"):
        return jsonify({'success': False, 'error': 'fuck you'}), 409
    
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(port=5000, debug=True)