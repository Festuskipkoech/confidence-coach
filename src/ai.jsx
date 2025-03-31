// azureOpenAIService.js

import axios from 'axios';

const AZURE_ENDPOINT = process.env.REACT_APP_AZURE_ENDPOINT;
const AZURE_API_KEY = process.env.REACT_APP_AZURE_API_KEY;
const DEPLOYMENT_NAME = process.env.REACT_APP_DEPLOYMENT_NAME;

/**
 * Call Azure OpenAI service to get AI coaching responses
 * @param {Array} messages - Conversation history in the format required by OpenAI API
 * @returns {Promise<string>} - AI response text
 */
export const getCoachingResponse = async (messages) => {
  try {
    // Add system message to define the AI's role and behavior
    const systemMessage = {
      role: "system",
      content: `You are a supportive, empathetic confidence coach specialized in helping people overcome 
      anxiety in public speaking, presentations, and high-pressure social situations. Your goal is to help 
      users build confidence through practical advice and targeted exercises.
      
      Follow these guidelines:
      1. Be encouraging but realistic - acknowledge difficulties while focusing on growth
      2. Ask clarifying questions when needed to better understand the specific situation
      3. Provide actionable, specific advice tailored to the user's context
      4. Suggest exercises or practices that build confidence incrementally
      5. Use a warm, supportive tone while maintaining professionalism
      6. When appropriate, share relevant principles from psychology or public speaking best practices
      7. Help users identify specific fears and address them individually
      8. Look for opportunities to reframe negative self-talk into positive or neutral perspectives
      
      Avoid:
      - Generic platitudes or clichés
      - Dismissing the user's concerns
      - Overwhelming the user with too many suggestions at once
      
      Focus on creating a supportive environment where the user feels understood while 
      providing clear, practical guidance for their specific confidence challenges.`
    };

    const conversationWithSystem = [systemMessage, ...messages];

    const response = await axios.post(
      `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=2023-05-15`,
      {
        messages: conversationWithSystem,
        temperature: 0.7,
        max_tokens: 800,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_API_KEY,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Azure OpenAI:', error);
    throw new Error('Failed to get AI response');
  }
};

/**
 * Analyze user input to determine confidence challenges
 * @param {string} text - User input to analyze
 * @returns {Promise<Object>} - Analysis of confidence issues
 */
export const analyzeConfidenceIssues = async (text) => {
  try {
    const systemMessage = {
      role: "system",
      content: `You are an AI specialized in analyzing text to identify confidence issues and challenges
      related to public speaking, social situations, and performance anxiety. Extract key concerns, fears,
      and potential improvement areas from the user's text.`
    };

    const response = await axios.post(
      `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=2023-05-15`,
      {
        messages: [
          systemMessage,
          { role: "user", content: text }
        ],
        temperature: 0.3, // Lower temperature for more focused analysis
        max_tokens: 500,
        top_p: 0.95,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_API_KEY,
        },
      }
    );

    // Parse the response to extract structured data about confidence issues
    const analysisText = response.data.choices[0].message.content;
    
    // Here we would parse the text into a structured format
    // For demonstration, we'll return a simple object
    // In production, you would use more sophisticated parsing
    return {
      mainChallenges: extractChallenges(analysisText),
      suggestedApproaches: extractSuggestions(analysisText),
      confidenceScore: estimateConfidenceScore(analysisText)
    };
  } catch (error) {
    console.error('Error analyzing confidence issues:', error);
    throw new Error('Failed to analyze input');
  }
};

/**
 * Generate a personalized confidence-building exercise
 * @param {Object} userProfile - User's profile and confidence challenges
 * @returns {Promise<Object>} - Personalized exercise
 */
export const generateExercise = async (userProfile) => {
  try {
    const prompt = `Create a personalized confidence-building exercise for a user with the following profile:
    
    Main goal: ${userProfile.mainGoal}
    Challenge areas: ${userProfile.challengeAreas.join(', ')}
    Current confidence level: ${userProfile.confidenceLevel || 'Unknown'}
    
    The exercise should be specific, actionable, and take no more than 5-10 minutes to complete.
    Include clear instructions and explain how this exercise will help build confidence.`;

    const response = await axios.post(
      `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=2023-05-15`,
      {
        messages: [
          { role: "system", content: "You are a confidence coach specializing in creating effective exercises." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 600,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_API_KEY,
        },
      }
    );

    const exerciseText = response.data.choices[0].message.content;
    
    // Parse the exercise into a structured format
    return {
      title: extractExerciseTitle(exerciseText),
      instructions: exerciseText,
      duration: "5-10 minutes",
      targetSkill: determineTargetSkill(userProfile.challengeAreas)
    };
  } catch (error) {
    console.error('Error generating exercise:', error);
    throw new Error('Failed to generate exercise');
  }
};

// Helper functions for parsing AI responses
// These would be more sophisticated in a production app

function extractChallenges(text) {
  // Simple extraction for demo purposes
  // In production, use more sophisticated NLP techniques
  const challenges = [];
  if (text.toLowerCase().includes('public speaking')) challenges.push('Public Speaking');
  if (text.toLowerCase().includes('social anxiety')) challenges.push('Social Anxiety');
  if (text.toLowerCase().includes('presentation')) challenges.push('Presentations');
  if (text.toLowerCase().includes('interview')) challenges.push('Interviews');
  
  // Default if nothing found
  return challenges.length > 0 ? challenges : ['General Confidence'];
}

function extractSuggestions(text) {
  // Simplified for demo
  const approaches = [];
  if (text.toLowerCase().includes('breathing')) approaches.push('Breathing Exercises');
  if (text.toLowerCase().includes('practice')) approaches.push('Practice Routines');
  if (text.toLowerCase().includes('visualiz')) approaches.push('Visualization');
  if (text.toLowerCase().includes('prepar')) approaches.push('Preparation Strategies');
  
  return approaches.length > 0 ? approaches : ['Personalized Coaching'];
}

function estimateConfidenceScore(text) {
  // Very simplified scoring for demo
  const negativePhrases = ['very anxious', 'terrified', 'extremely nervous', 'panic'];
  const moderatePhrases = ['somewhat nervous', 'uncomfortable', 'worried'];
  const positivePhrases = ['some confidence', 'getting better', 'improving'];
  
  let score = 50; // Default middle score
  
  // Adjust based on phrase matches
  negativePhrases.forEach(phrase => {
    if (text.toLowerCase().includes(phrase)) score -= 10;
  });
  
  moderatePhrases.forEach(phrase => {
    if (text.toLowerCase().includes(phrase)) score -= 5;
  });
  
  positivePhrases.forEach(phrase => {
    if (text.toLowerCase().includes(phrase)) score += 10;
  });
  
  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score));
}

function extractExerciseTitle(text) {
  // Simple extraction of first line as title
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length > 0) {
    return lines[0].replace(/^#+ /, '').trim();
  }
  return "Confidence Building Exercise";
}

function determineTargetSkill(challengeAreas) {
  const skillMap = {
    'Public Speaking': 'Voice Projection',
    'Social Anxiety': 'Anxiety Management',
    'Presentations': 'Body Language',
    'Interviews': 'Content Organization'
  };
  
  // Find first matching skill
  for (const challenge of challengeAreas) {
    if (skillMap[challenge]) return skillMap[challenge];
  }
  
  return "General Confidence";
}

export default {
  getCoachingResponse,
  analyzeConfidenceIssues,
  generateExercise
};