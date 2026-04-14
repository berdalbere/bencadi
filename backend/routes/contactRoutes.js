const express = require('express');
const router = express.Router();

const messages = [];

router.post('/', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants.' });
  messages.push({ id: Date.now(), name, email, phone, subject, message, date: new Date(), read: false });
  res.status(201).json({ success: true, message: 'Message envoyé. Nous vous répondrons bientôt !' });
});

router.get('/', (req, res) => {
  res.json({ success: true, messages: [...messages].reverse() });
});

module.exports = router;
