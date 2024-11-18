const express = require('express');
const axios = require('axios');
const router = express.Router();

// NewsAPI integration
router.get('/news', async (req, res) => {
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=0a16b8d9799945b2920006b943558aa2`);
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error fetching news');
  }
});

// Unsplash integration for exchange rates
router.get('/exchange-rate', async (req, res) => {
  try {
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/a245ebd18ba787b10bd4715d/latest/USD`);
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error fetching exchange rates');
  }
});

module.exports = router;