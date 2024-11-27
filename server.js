const express = require("express");
const connection = require("./application/config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const router = require("./application/routes/router");
const OneSignal = require('onesignal-node');
const client = new OneSignal.Client('b59e1898-4b25-4980-b676-ae782af2312f', 'os_v2_app_wwpbrgcleveybntwvz4cv4rrf5yxli5gwduef4m6ryhsyesjovlmvoef3fgoaenif3wchrwlwssux2w7yo7wu4lwx353gd6g4sxfopa');

const app = express();

const port = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use("/", router);
app.use(express.json());

const sendNotification = async (data) => {
    try {
        const response = await client.createNotification({
            contents: { en: data.message },
            included_segments: ['Subscribed Users'], 
        });
        console.log('Notification sent:', response);
    } catch (err) {
        console.error('Error sending notification:', err);
    }
};

app.post('/send-notification', async (req, res) => {
    const { message } = req.body;
    await sendNotification({ message });
    res.status(200).send('Notification sent successfully!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
