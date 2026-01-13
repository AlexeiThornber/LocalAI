from flask import  Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import os
import json
import shutil
import requests
import hashlib

app = Flask(__name__)
CORS(app)

USERS_DIR = os.path.join(os.path.dirname(__file__), 'users/')

max_users = 5


#===================================================================================================================
#Helper functions
#===================================================================================================================
 
def load_user_json(username: str):
    user_file = os.path.join(USERS_DIR, username, 'user.json')
    if not os.path.exists(user_file):
        return None
    with open(user_file, 'r') as f:
        return json.load(f)
    

def save_chat_history(username: str, chatID: str, timestamp: int, title: str, history: list): 
    user_dir = os.path.join(USERS_DIR, username)
    os.makedirs(user_dir, exist_ok=True)

    chat_file = os.path.join(user_dir, f"{chatID}.json")

    # A new file, we define the new timestamp
    if not os.path.exists(chat_file):
        to_write = {'title': title, 'timestamp': timestamp, 'history': history} 
    
    # The file already exists, we read the existent timestamp and rewrite it
    else:
        with open(chat_file, 'r') as f:
            data = json.load(f)
        to_write = {'title': data.get('title'), 'timestamp': data.get('timestamp'), 'history': history} 


    with open(chat_file, 'w') as f:
        json.dump(to_write, f, indent=2)


def sha256_hash(message):
    return hashlib.sha256(message.encode('utf-8')).hexdigest()


#===================================================================================================================
# API calls to Ollama
#===================================================================================================================
 
@app.route('/ollama/generate', methods=['POST'])
def ollama_generate():
    """Proxy requests to Ollama"""
    data = request.json

    try:
        # Forward request to Ollama
        ollama_response = requests.post(
            'http://alexei-server-aspire-gx-781.tailbaa1e6.ts.net:11434/api/generate',
            json=data,
            stream=data.get('stream', False)
        )
        
        if data.get('stream', True):
            # Stream response back to client
            def generate():
                for line in ollama_response.iter_lines():
                    if line:
                        yield line + b'\n'
            
            return Response(
                stream_with_context(generate()),
                content_type='application/json'
            )
        else:
            # Return complete response
            return jsonify(ollama_response.json())
            
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/ollama/models', methods=['GET'])
def ollama_models():
    """List available Ollama models"""
    try:
        response = requests.get('http://alexei-server-aspire-gx-781.tailbaa1e6.ts.net:11434/api/tags')
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


#===================================================================================================================
# API calls to the db
#===================================================================================================================
 
@app.route('/loadAll', methods = ['POST'])
def loadAll():
    data = request.json

    username = data.get('username')

    user_dir = os.path.join(USERS_DIR, username)
    chats = []

    if not os.path.exists(user_dir):
        return jsonify({'success': False, 'error': f'User not found with username {username} not found'}), 404

    for fname in os.listdir(user_dir):
        if fname.endswith('.json') and fname != 'user.json':
            chatID = fname[:-5] # Remove the .json at the end
            
            with open(os.path.join(user_dir, fname), 'r') as f:
                data_file = json.load(f)

            chats.append({
                'chatID': chatID,
                'title': data_file.get('title'),
                'timestamp': data_file.get('timestamp')
            })

    return jsonify({'success': True, 'chats': chats})



@app.route('/loadChat', methods = ['POST'])
def loadChat():
    data = request.json

    username = data.get('username')
    chatID = data.get('chatID')

    chat_file = os.path.join(USERS_DIR, username, f"{chatID}.json")

    if not os.path.exists(chat_file):
         return jsonify({'success': False, 'error': f'file not found with name {chatID}'}), 404
    
    with open(chat_file, 'r') as f:
        content = f.read()

    return jsonify({'success': True, 'chatID': chatID, 'content': content})



@app.route('/save', methods = ['POST'])
def save():
    data = request.json

    username: str = data.get('username')
    chatId: str = data.get('chatID')
    timestamp: int = data.get('timestamp')
    title: str = data.get('title')
    history: list = data.get('history')

    if chatId == "":
        return jsonify({'success': False, 'error': 'ChatID is null or empty, it must have a value'})

    try:
        save_chat_history(username, chatId, timestamp, title, history)
    except Exception as e:
        print(f"Error saving chat history: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

    return jsonify({'success': True})


@app.route('/deleteChat', methods = ['POST'])
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


@app.route('/deleteAccount', methods = ['POST'])
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


@app.route('/login', methods = ['POST'])
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

    if sha256_hash(password) != user_data["password"]:
        return jsonify({'success': False, 'error': f'Wrong password for user: {username}'}), 400
        
    return jsonify({'success': True})
    


@app.route('/create-account', methods=['POST'])
def create_account():
    data = request.json
    username = data.get('username')
    password = data.get('password')

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
        'password': sha256_hash(password)
    }

    with open(user_file, 'w') as f:
        json.dump(user_data, f)

    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
