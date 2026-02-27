import fs from 'fs';

const BASE_URL = 'https://themrstudi.onrender.com';
const ADMIN_CREDENTIALS = { username: 'admin', password: 'wadisheni' };

async function runTests() {
    console.log("Starting Production Diagnostic Tests...\n");

    try {
        // 1. Test standard GET to see if server is alive
        console.log("1. Checking Server Health...");
        const health = await fetch(`${BASE_URL}/api/services`);
        console.log("   Health Status:", health.status, await health.text().then(t => t.substring(0, 50)));

        // 2. Test Booking Creation (Client side, no auth needed)
        console.log("\n2. Testing Booking Creation...");
        const bookingPayload = {
            fullName: "Test User",
            email: "test@example.com",
            phone: "5551234567",
            service: "Standard Manicure",
            staffId: "0ba7a856-5506-45f8-a0e8-471836793b82", // Using Mariam's ID from logs
            staffName: "მარიამი",
            date: "2026-12-31",
            time: "14:00",
            duration: "60",
            notes: "Test booking from diagnostic script"
        };

        const bookingRes = await fetch(`${BASE_URL}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingPayload)
        });

        console.log("   Booking Status:", bookingRes.status);
        console.log("   Booking Response:", await bookingRes.text());

        // 3. Admin Auth for Upload Test
        console.log("\n3. Authenticating as Admin...");
        let cookie = "";
        const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ADMIN_CREDENTIALS)
        });
        console.log("   Login Status:", loginRes.status);

        const rawCookies = loginRes.headers.get('set-cookie');
        if (rawCookies) {
            cookie = rawCookies.split(';')[0];
            console.log("   Session Cookie acquired.");
        } else {
            console.log("   WARNING: No session cookie received! Upload will fail.");
        }

        // 4. Test Photo Upload
        console.log("\n4. Testing Photo Upload...");
        fs.writeFileSync('test1.jpg', 'fake image content');

        const formData = new FormData();
        const blob = new Blob([new Uint8Array(fs.readFileSync('test1.jpg'))], { type: 'image/jpeg' });
        formData.append('file', blob, 'test1.jpg');

        const uploadRes = await fetch(`${BASE_URL}/api/objects/upload`, {
            method: 'POST',
            headers: {
                'Cookie': cookie
            },
            body: formData
        });

        console.log("   Upload Status:", uploadRes.status);
        console.log("   Upload Response:", await uploadRes.text());

    } catch (err) {
        console.error("Diagnostic script encountered an error:", err);
    }
}

runTests();
