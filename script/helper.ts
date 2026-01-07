// export async function hashPassword(password: string): Promise<string> {
//     const encoder = new TextEncoder();
//     const data = encoder.encode(password);
//     const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
//     // Convert buffer to hex string
//     return Array.from(new Uint8Array(hashBuffer))
//         .map(b => b.toString(16).padStart(2, '0'))
//         .join('');
// }

//DEBUGGING puporses only
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
