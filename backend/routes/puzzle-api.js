const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.get('/categories', (req, res) => {
    const dataDir = path.join(__dirname, '../data/puzzle');
    
    fs.readdir(dataDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read categories' });
        }
        
        const categories = files
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
        
        res.json({ categories });
    });
});

router.get('/words/:category', (req, res) => {
    const category = req.params.category;
    const filePath = path.join(__dirname, `../data/puzzle/${category}.json`);
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (parseError) {
            res.status(500).json({ error: 'Invalid JSON data' });
        }
    });
});

module.exports = router;