require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log(`Total users: ${users.length}`);
        const emails = {};
        for (let u of users) {
            if (!emails[u.email]) emails[u.email] = [];
            emails[u.email].push(u);
        }
        for (let e in emails) {
            if (emails[e].length > 1) {
                console.log(`DUPLICATE EMAIL FOUND: "${e}"`, emails[e].map(u => ({ id: u._id, name: u.name, googleId: u.googleId })));
            }
        }

        // Also log all emails to see if there are spaces
        console.log("All emails in DB:", users.map(u => `"${u.email}"`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
