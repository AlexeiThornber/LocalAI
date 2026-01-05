
export async function login(
    username: string,
    passwordHash: string,
    type: string, //Type can be login or create-account
    ){
    const response = await fetch(`http://localhost:5000/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username: username, password: passwordHash})
    });
        
    const text = await response.text(); 
    let result: { success: any; error: any; };

    try {
        result = JSON.parse(text);
        console.log("Parsed JSON:", result);
    } catch (e) {
        console.error("JSON parse error:", e);
    }

    if(result.success){
        sessionStorage.setItem('username', username);
        window.location.href = `main.html`;
    }else{
        alert(`Error: ${result.error}`);   
    }
}

export async function loadAllTitles(
    uid: string,
    callback:(titles: string[]) => void
): Promise<void>{
    const response = await fetch('http://localhost:5000/api/loadAll',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username: uid})
    });

    const text = await response.text();
    let result: { success: any; titles: string[]; error: any; };
    
    try {
        result = JSON.parse(text);
        console.log("Parsed JSON:", result);
    } catch (e) {
        console.error("JSON parse error:", e);
    }

    callback(result.titles);
}

export async function fetchChat(
    uid: string,
    chatId: string,
    callback: (title: string, content: any) => void
): Promise<void>{

    const response = await fetch('http://localhost:5000/api/loadChat',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username: uid, chatID: chatId})
    })

    const text = await response.text();
    let result: { success: any; chatTitle: string; content: string; error: any; };

    try {
        result = JSON.parse(text);
        console.log("Parsed JSON:", result);
    } catch (e) {
        console.error("JSON parse error:", e);
    }

    callback(result.chatTitle, JSON.parse(result.content))
}

export async function deleteChat(
    uid: string,
    chatId: string
): Promise<void>{

    const response = await fetch('http://localhost:5000/api/deleteChat',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username: uid, chatID: chatId})
    });

    const text = await response.text();
    const result = JSON.parse(text);

    // if(result.success){
        //alert(`chat with title: ${chatId} has successfully been deleted`);
    // }
}

export async function saveMessages(uid: string, chatId: string,  messages: string[]){
    const conversationHistory: Array<{user:string, bot:string}> = [];

    for(let i = 0; i < messages.length; i += 2){
        const userMsg = messages[i];
        const botMsg = messages[i + 1];
        conversationHistory.push({
            user: userMsg,
            bot: botMsg
        });
    }

    const payload = {
        username: uid,
        chatID: chatId,
        history: conversationHistory
    }

    console.log(payload);

    const response = await fetch(`http://localhost:5000/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}