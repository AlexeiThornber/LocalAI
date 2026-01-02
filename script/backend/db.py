from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

USERS_DIR = os.path.join(os.path.dirname(__file__), '../../users')

def load_user_json(username):
    user_file = os.path.join(USERS_DIR, username, 'user.json')
    if not os.path.exists(user_file):
        return None
    with open(user_file, 'r') as f:
        return json.load(f)

@app.route('/api/login', methods = ['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'error': 'Username and password required'}), 400
    
    usernames = {
        name for name in os.listdir(USERS_DIR) if os.path.isdir(os.path.join(USERS_DIR, name))
    }

    if not (username in usernames):
        return jsonify({'success': False, 'error': f'User with username: {username} does not exists'}), 400
    
    user_data = load_user_json(username)

    if password != user_data["password"]:
        return jsonify({'success': False, 'error': f'Wrong password for user: {username}'}), 400
        
    return jsonify({'success': True})
    


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

    user_data = {
        'username': username,
        'password': password
    }

    with open(user_file, 'w') as f:
        json.dump(user_data, f)

    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
