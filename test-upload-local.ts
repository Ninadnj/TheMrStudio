import fs from 'fs';

const BASE_URL = 'http://localhost:5002';
const ADMIN_CREDENTIALS = { username: 'admin', password: 'wadisheni' };

async function runTest() {
    try {
        let cookie = "";
        const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ADMIN_CREDENTIALS)
        });
        const rawCookies = loginRes.headers.get('set-cookie');
        if (rawCookies) cookie = rawCookies.split(';')[0];

        fs.writeFileSync('test1.jpg', 'fake image content');
        const formData = new FormData();
        const blob = new Blob([new Uint8Array(fs.readFileSync('test1.jpg'))], { type: 'image/jpeg' });
        formData.append('file', blob, 'test1.jpg');

        const uploadRes = await fetch(`${BASE_URL}/api/objects/upload`, {
            method: 'POST',
            headers: { 'Cookie': cookie },
            body: formData
        });

        console.log("Upload Status:", uploadRes.status);
        console.log("Upload Response:", await uploadRes.text());
    } catch (err) {
        console.error(err);
    }
}
runTest();
