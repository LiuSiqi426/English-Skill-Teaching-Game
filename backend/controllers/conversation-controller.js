const fs = require('fs').promises;
const path = require('path');

const scenesDirectory = path.join(__dirname, '../data/conversation');

class ConversationController {
  async getAllScenes(req, res) {
    try {
      console.log('Fetching scenes from:', scenesDirectory);
      
      try {
        await fs.access(scenesDirectory);
      } catch (error) {
        console.error('Scenes directory not found:', error.message);
        return res.json({
          success: true,
          data: [] 
        });
      }
      
      const files = await fs.readdir(scenesDirectory);
      console.log('Found files:', files);
      
      const scenes = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(scenesDirectory, file);
          console.log('Reading file:', filePath);
          
          try {
            const data = await fs.readFile(filePath, 'utf8');
            const sceneData = JSON.parse(data);
            
            scenes.push({
              id: sceneData.scene,
              title: sceneData.title,
              description: sceneData.description,
              questionCount: sceneData.questions ? sceneData.questions.length : 0
            });
            
            console.log('Loaded scene:', sceneData.scene);
          } catch (readError) {
            console.error('Error reading file:', file, readError.message);
          }
        }
      }
      
      console.log('Total scenes loaded:', scenes.length);
      
      res.json({
        success: true,
        data: scenes
      });
    } catch (error) {
      console.error('Error fetching scenes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch scenes: ' + error.message
      });
    }
  }

  async getSceneById(req, res) {
    try {
      const { sceneId } = req.params;
      
      console.log('Fetching scene data for:', sceneId);
      console.log('Looking in directory:', scenesDirectory);
      
      const files = await fs.readdir(scenesDirectory);
      console.log('Available files:', files);
      
      const validScenes = ['restaurant', 'hotel', 'zoo'];
      
      if (!validScenes.includes(sceneId)) {
        return res.status(404).json({
          success: false,
          error: `Scene not found. Must be one of: ${validScenes.join(', ')}`
        });
      }
      
      const filePath = path.join(scenesDirectory, `${sceneId}.json`);
      console.log('Looking for file:', filePath);
      
      try {
        await fs.access(filePath);
      } catch (accessError) {
        console.error('File not found:', filePath);
        return res.status(404).json({
          success: false,
          error: 'Scene data file not found'
        });
      }
      
      const data = await fs.readFile(filePath, 'utf8');
      const sceneData = JSON.parse(data);
      
      console.log('Successfully loaded scene:', sceneId);
      
      res.json({
        success: true,
        data: sceneData
      });
    } catch (error) {
      console.error('Error fetching scene data:', error);
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          error: 'Scene data file not found'
        });
      }
      res.status(500).json({
        success: false,
        error: 'Failed to fetch scene data: ' + error.message
      });
    }
  }

  async submitAnswer(req, res) {
    try {
      const { sceneId, questionId, selectedOptionId } = req.body;
      
      console.log('Submit answer request:', { sceneId, questionId, selectedOptionId });
      
      if (!sceneId || !questionId || !selectedOptionId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: sceneId, questionId, selectedOptionId'
        });
      }
      
      const filePath = path.join(scenesDirectory, `${sceneId}.json`);
      console.log('Loading scene from:', filePath);
      
      const data = await fs.readFile(filePath, 'utf8');
      const sceneData = JSON.parse(data);
      
      const question = sceneData.questions.find(q => q.id === parseInt(questionId));
      if (!question) {
        return res.status(404).json({
          success: false,
          error: `Question with id ${questionId} not found`
        });
      }
      
      const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
      if (!selectedOption) {
        return res.status(404).json({
          success: false,
          error: `Option with id ${selectedOptionId} not found`
        });
      }
      
      const correctOption = question.options.find(opt => opt.correct);
      if (!correctOption) {
        return res.status(500).json({
          success: false,
          error: 'No correct option found for this question'
        });
      }
      
      console.log('Answer check:', {
        selected: selectedOption.id,
        correct: correctOption.id,
        isCorrect: selectedOption.correct
      });
      
      res.json({
        success: true,
        data: {
          isCorrect: selectedOption.correct,
          correctOptionId: correctOption.id,
          explanation: selectedOption.correct ? 'Correct answer!' : 'Wrong answer, try again!'
        }
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit answer: ' + error.message
      });
    }
  }

  async calculateResult(req, res) {
    try {
      console.log('Calculate result request:', req.body);
      
      const { score, totalQuestions = 10 } = req.body;
      
      if (score === undefined || score === null) {
        return res.status(400).json({
          success: false,
          error: 'Score is required'
        });
      }
      
      const scoreNum = Number(score);
      const totalNum = Number(totalQuestions);
      
      console.log(`Score: ${scoreNum}, Total Questions: ${totalNum}`);
      
      if (isNaN(scoreNum) || scoreNum < 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid score value'
        });
      }
      
      const correctAnswers = Math.floor(scoreNum / 10);
      
      let stars = 0;
      if (correctAnswers === 10) stars = 3;
      else if (correctAnswers >= 8) stars = 2;
      else if (correctAnswers >= 6) stars = 1;
      
      console.log(`Correct answers: ${correctAnswers}, Stars: ${stars}`);
      
      let message;
      if (stars === 3) {
        message = 'Excellent! Perfect score!';
      } else if (stars === 2) {
        message = 'Great job! Well done!';
      } else if (stars === 1) {
        message = 'Good effort! Keep practicing!';
      } else {
        message = 'Keep practicing, you will get better!';
      }
      
      res.json({
        success: true,
        data: {
          score: scoreNum,
          totalScore: 100,
          correctAnswers: correctAnswers,
          totalQuestions: totalNum,
          stars: stars,
          message: message
        }
      });
      
    } catch (error) {
      console.error('Error in calculateResult:', error);
      res.status(500).json({
        success: false,
        error: 'Server error: ' + error.message
      });
    }
  }
}

module.exports = new ConversationController();