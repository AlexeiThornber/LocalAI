from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import shutil

app = Flask(__name__)
CORS(app)

USERS_DIR = os.path.join(os.path.dirname(__file__), 'users/')

max_users = 5


#===================================================================================================================
#Helper functions
#===================================================================================================================
 
def load_user_json(username):
    user_file = os.path.join(USERS_DIR, username, 'user.json')
    if not os.path.exists(user_file):
        return None
    with open(user_file, 'r') as f:
        return json.load(f)
    

def save_chat_history(username: str, chatID: str, timestamp: int, history: list): 
    user_dir = os.path.join(USERS_DIR, username)
    os.makedirs(user_dir, exist_ok=True)
    chat_file = os.path.join(user_dir, f"{chatID}.json")

    # A new file, we define the new timestamp
    if not os.path.exists(chat_file):
        to_write = {'timestamp': timestamp, 'history': history} 
    
    # The file already exists, we read the existent timestamp and rewrite it
    else:
        with open(chat_file, 'r') as f:
            data = json.load(f)
        to_write = {'timestamp': data.get('timestamp'), 'history': history} 


    with open(chat_file, 'w') as f:
        json.dump(to_write, f, indent=2)


#===================================================================================================================
# API calls 
#===================================================================================================================
 
@app.route('/api/loadAll', methods = ['POST'])
def loadAll():
    data = request.json

    username = data.get('username')

    user_dir = os.path.join(USERS_DIR, username)
    titles = []
    timestamps = []

    if not os.path.exists(user_dir):
        return jsonify({'success': False, 'error': f'User not found with username {username} not found'}), 404

    for fname in os.listdir(user_dir):
        if fname.endswith('.json') and fname != 'user.json':
            title = fname[:-5] # Remove the .json at the end
            titles.append(title)
            
            with open(os.path.join(user_dir, fname), 'r') as f:
                data_file = json.load(f)
            timestamps.append(data_file.get('timestamp'))


    return jsonify({'success': True, 'titles': titles, 'timestamps': timestamps})



@app.route('/api/loadChat', methods = ['POST'])
def loadChat():
    data = request.json

    username = data.get('username')
    chatID = data.get('chatID')

    chat_file = os.path.join(USERS_DIR, username, f"{chatID}.json")

    if not os.path.exists(chat_file):
         return jsonify({'success': False, 'error': f'file not found with name {chatID}'}), 404
    
    with open(chat_file, 'r') as f:
        content = f.read()

    return jsonify({'success': True, 'chatTitle': chatID, 'content': content})



@app.route('/api/save', methods = ['POST'])
def save():
    data = request.json

    username = data.get('username')
    chatId = data.get('chatID')
    timestamp = data.get('timestamp')
    history = data.get('history')

    try:
        save_chat_history(username, chatId, timestamp, history)
    except Exception as e:
        print(f"Error saving chat history: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

    return jsonify({'success': True})


@app.route('/api/deleteChat', methods = ['POST'])
def deleteChat():
    data = request.json

    username = data.get("username")
    chatID = data.get("chatID")

    if chatID == "users":
        return jsonify({'success': False, 'error': 'Not allowed to delete user.json'}), 500

    chat_file = os.path.join(USERS_DIR, username, f"{chatID}.json")

    if not os.path.exists(chat_file):
        print(f'file not found with name {chatID}')
        return jsonify({'success': False, 'error': f'file not found with name {chatID}'}), 404
    
    try:
        os.remove(chat_file)
    except Exception as e:
        print(f"Error saving chat history: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

    return jsonify({'success': True})


@app.route('/api/deleteAccount', methods = ['POST'])
def deleteAccount():
    data = request.json

    uid = data.get('username')

    user_folder = os.path.join(USERS_DIR, uid)

    if not os.path.exists(user_folder):
        print(f'user not found with name {uid}')
        return jsonify({'success': False, 'error': f'Folder not found with username {uid}'}), 404

    try:
        shutil.rmtree(user_folder)
    except Exception as e:
        print(f"Error when deleting user: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
    
    return jsonify({'success': True})


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
        return jsonify({'success': False, 'error': f'User already with username: {username} already exists'}), 409
    
    if len(os.listdir(USERS_DIR)) >= max_users:
        return jsonify({'success': False, 'error': f'Max user count reached: {max_users}'}), 409

    os.makedirs(user_dir, exist_ok=True)

    user_data = {
        'username': username,
        'password': password
    }

    with open(user_file, 'w') as f:
        json.dump(user_data, f)

    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
