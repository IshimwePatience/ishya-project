const { Script, Production, Talent } = require('../models');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

exports.getAllScripts = async (req, res) => {
  try {
    const scripts = await Script.findAll({
      include: [
        { model: Production, as: 'production' },
        { model: Talent, as: 'assignedActors', through: { attributes: [] } }
      ]
    });
    res.json(scripts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createScript = async (req, res) => {
  try {
    const { talentIds, ...scriptData } = req.body;
    const script = await Script.create(scriptData);
    
    if (talentIds && talentIds.length > 0) {
      await script.setAssignedActors(talentIds);
    }
    
    const updatedScript = await Script.findByPk(script.id, {
      include: [
        { model: Production, as: 'production' },
        { model: Talent, as: 'assignedActors', through: { attributes: [] } }
      ]
    });
    
    res.status(201).json(updatedScript);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateScript = async (req, res) => {
  try {
    const { talentIds, ...scriptData } = req.body;
    const script = await Script.findByPk(req.params.id);
    if (!script) return res.status(404).json({ message: 'Script not found' });
    
    await script.update(scriptData);
    
    if (talentIds) {
      await script.setAssignedActors(talentIds);
    }
    
    const updatedScript = await Script.findByPk(script.id, {
      include: [
        { model: Production, as: 'production' },
        { model: Talent, as: 'assignedActors', through: { attributes: [] } }
      ]
    });
    
    res.json(updatedScript);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteScript = async (req, res) => {
  try {
    const script = await Script.findByPk(req.params.id);
    if (!script) return res.status(404).json({ message: 'Script not found' });
    await script.destroy();
    res.json({ message: 'Script deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateAiReview = async (req, res) => {
  try {
    const script = await Script.findByPk(req.params.id, {
      include: [{ model: Production, as: 'production' }]
    });
    if (!script) return res.status(404).json({ message: 'Script not found' });
    
    if (script.aiReview) {
      return res.json({ message: 'Review already exists', review: script.aiReview });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is missing from .env. Please configure it to use AI features.' });
    }

    const fullUrl = script.filePath.startsWith('http') ? script.filePath : `${process.env.SUPABASE_URL || 'https://twqeninkntadpjtelisj.supabase.co'}/storage/v1/object/public/ishya-bucket${script.filePath}`;
    
    let buffer;
    try {
      const response = await fetch(fullUrl);
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch (err) {
      return res.status(400).json({ message: 'Failed to download PDF for analysis.' });
    }

    const data = await pdfParse(buffer);
    const text = data.text || '';
    
    if (!text.trim()) {
      return res.status(400).json({ message: 'Could not extract any text from this PDF.' });
    }

    const truncatedText = text.substring(0, 15000);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
Please analyze the following movie/play script excerpt and provide a structured JSON response.
Consider the following context about the production:
- Intended Genre: ${script.production?.genre || 'Unknown'}
- Production Details / Audience: ${script.production?.description || 'General Audience'}

The JSON must have the following keys:
{
  "tone": "The overall tone and how well it fits the intended genre",
  "audience_fit": "An analysis of how well this script fits its intended target audience",
  "characters": [
    { "name": "Character Name", "description": "Brief description of the character" }
  ],
  "feedback": "A short professional critique of the script"
}

Script Excerpt:
${truncatedText}
`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    const reviewJSON = JSON.parse(result.text);

    script.aiReview = reviewJSON;
    await script.save();

    res.json({ message: 'Review generated successfully', review: script.aiReview });
  } catch (error) {
    console.error('AI Review Error:', error);
    res.status(500).json({ message: 'Failed to generate AI review. ' + error.message });
  }
};
