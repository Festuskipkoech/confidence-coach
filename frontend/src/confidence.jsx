import React, { useState } from 'react';
import { Send, Mic, Brain, Users, PresentationIcon, Lightbulb, ArrowRight, Sparkles, Loader, BriefcaseIcon, MessageCircle, ThumbsUp, HelpCircle, RefreshCw } from 'lucide-react';
import { FormattedMessage } from './format';

const AZURE_OPENAI_KEY =import.meta.env.VITE_URL_AZURE_API_KEY
const AZURE_OPENAI_ENDPOINT=import.meta.env.VITE_URL_AZURE_ENDPOINT
const AZURE_OPENAI_DEPLOYMENT =import.meta.env.VITE_URL_DEPLOYMENT_ID

const ConfidenceCoach = () => {
  const [step, setStep] = useState('select'); // select, questions, analysis, solutions
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [analysis, setAnalysis] = useState('');
  const [solutions, setSolutions] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loadingState, setLoadingState] = useState(''); // '', 'analysis', 'solutions'
  const [multiChoiceSelected, setMultiChoiceSelected] = useState(null);
  
  // Common confidence issues with updated icons and descriptions
  const confidenceIssues = [
    { 
      id: 'public-speaking', 
      title: 'Public Speaking Anxiety', 
      icon: <Users size={24} />, 
      description: 'Overcome nervousness when speaking to groups' 
    },
    { 
      id: 'interviewing', 
      title: 'Interview Confidence', 
      icon: <BriefcaseIcon size={24} />, 
      description: 'Ace your next job interview with confidence' 
    },
    { 
      id: 'pitch-ideas', 
      title: 'Pitching Ideas', 
      icon: <PresentationIcon size={24} />, 
      description: 'Present your ideas with clarity and confidence' 
    },
    { 
      id: 'self-doubt', 
      title: 'Self-Doubt', 
      icon: <Brain size={24} />, 
      description: 'Overcome imposter syndrome and believe in yourself' 
    }
  ];

  // Questions based on the client document for each category
  const getQuestions = (issueId) => {
    const questions = {
      'public-speaking': [
        {
          text: "How do you usually feel when you're asked to speak in front of others, even if it's just a small group?",
          type: "text"
        },
        {
          text: "Have you ever found yourself holding back from speaking up because you were feeling a little nervous or unsure?",
          type: "text"
        },
        {
          text: "What usually goes through your mind right before you have to talk in front of people?",
          type: "text"
        },
        {
          text: "Do you ever get that little voice in your head worrying about being judged or messing up while speaking?",
          type: "multiChoice",
          options: [
            "Yes, frequently",
            "Sometimes",
            "Rarely",
            "Never"
          ]
        },
        {
          text: "When someone says \"public speaking,\" do you feel a spark of excitement, a wave of nerves—or maybe a bit of both?",
          type: "multiChoice",
          options: [
            "Mostly excitement",
            "Mostly nervousness",
            "An equal mix of both",
            "Neither - I feel indifferent"
          ]
        },
        {
          text: "Have you ever noticed your heart race, your hands shake, or maybe even felt sweaty before speaking in front of others?",
          type: "multiChoice",
          options: [
            "Yes, all of those symptoms",
            "Some physical symptoms",
            "Mild nervousness only",
            "No physical reaction"
          ]
        },
        {
          text: "Just imagine - if you felt calm and confident speaking to a crowd, how do you think that would change things for you?",
          type: "text"
        }
      ],
      'interviewing': [
        {
          text: "How do you feel when you think about going for a job interview?",
          type: "text"
        },
        {
          text: "Is there a specific part of the interview process that feels overwhelming or stressful for you?",
          type: "text"
        },
        {
          text: "Have you had any past interview experiences that left you feeling discouraged or unsure of yourself?",
          type: "multiChoice",
          options: [
            "Yes, several times",
            "Yes, once or twice",
            "Not really",
            "No, never interviewed before"
          ]
        },
        {
          text: "Do you feel confident talking about your skills, experiences, and what makes you a great fit for a role?",
          type: "multiChoice",
          options: [
            "Very confident",
            "Somewhat confident",
            "Not very confident",
            "Not confident at all"
          ]
        },
        {
          text: "Do you ever worry about saying the \"wrong\" thing or going blank during an interview?",
          type: "multiChoice",
          options: [
            "Yes, all the time",
            "Sometimes",
            "Rarely",
            "Never"
          ]
        },
        {
          text: "Have you practiced answering common interview questions out loud or with someone else before?",
          type: "text"
        },
        {
          text: "What kind of support would make you feel more prepared and at ease before your next interview?",
          type: "text"
        }
      ],
      'pitch-ideas': [
        {
          text: "How do you feel when you think about pitching your idea to investors?",
          type: "multiChoice",
          options: [
            "😄 Excited and ready!",
            "😬 A little nervous",
            "😟 Anxious or overwhelmed",
            "🤔 Not sure yet"
          ]
        },
        {
          text: "What part of the pitch process makes you most nervous - speaking, answering questions, or something else?",
          type: "text"
        },
        {
          text: "Have you practiced your pitch out loud yet? If not, what's holding you back?",
          type: "multiChoice",
          options: [
            "Yes, several times",
            "Once or twice",
            "Not yet",
            "I'm too nervous to try"
          ]
        },
        {
          text: "Do you feel confident explaining the value of your idea in a simple, clear way?",
          type: "multiChoice",
          options: [
            "Very confident",
            "Somewhat confident",
            "Not very confident",
            "Not confident at all"
          ]
        },
        {
          text: "Are you worried about how investors might react or respond to your pitch?",
          type: "multiChoice",
          options: [
            "Yes, I'm afraid they won't take me seriously",
            "A little—I don't want to be judged",
            "Not really, I'm mostly focused on delivering well",
            "I haven't thought about it much"
          ]
        },
        {
          text: "Do you feel like your pitch deck or presentation tells a strong, compelling story?",
          type: "text"
        },
        {
          text: "What's one thought that pops up when you imagine walking into a pitch meeting?",
          type: "text"
        }
      ],
      'self-doubt': [
        {
          text: "Do you ever second-guess your ideas or decisions, even after putting a lot of thought into them?",
          type: "multiChoice",
          options: [
            "Yes, frequently",
            "Sometimes",
            "Rarely",
            "Never"
          ]
        },
        {
          text: "When you make a mistake, how do you usually talk to yourself?",
          type: "text"
        },
        {
          text: "Do you often compare yourself to others and feel like you're not doing enough?",
          type: "multiChoice",
          options: [
            "Yes, all the time",
            "Sometimes",
            "Rarely",
            "Never"
          ]
        },
        {
          text: "Have you ever held back from speaking up or going after something you wanted because you weren't sure you were \"good enough\"?",
          type: "text"
        },
        {
          text: "Do you feel uncomfortable when someone compliments you or celebrates your work?",
          type: "multiChoice",
          options: [
            "Yes, very uncomfortable",
            "Somewhat uncomfortable",
            "A little uncomfortable",
            "No, I receive compliments well"
          ]
        },
        {
          text: "Do you ever feel like a \"fraud\" or that you don't deserve your achievements (a.k.a. imposter syndrome)?",
          type: "multiChoice",
          options: [
            "Yes, frequently",
            "Sometimes",
            "Rarely",
            "Never"
          ]
        },
        {
          text: "Is it hard for you to start something new because you're afraid you won't do it perfectly?",
          type: "text"
        }
      ]
    };
    
    return questions[issueId] || [];
  };

  // Predefined strategies from the document
// Completely new AI-powered approach to generate strategies

// Keep a cache of generated strategies to avoid regenerating them
const strategyCache = {};

// This function will generate strategies using AI instead of using predefined ones
const getPredefinedStrategies = async (issueId) => {
  // If we already have generated strategies for this issue, return them from cache
  if (strategyCache[issueId]) {
    return strategyCache[issueId];
  }
  
  // Define the structure we expect for strategies based on the confidence area
  const strategyStructure = {
    'public-speaking': [
      {
        title: "Strategy focusing on starting small and building up",
        description: "How to gradually build confidence in speaking situations",
        steps: ["Step 1 detail", "Step 2 detail", "Step 3 detail"]
      },
      {
        title: "Strategy focusing on authenticity over perfection",
        description: "How to connect with audience through authenticity",
        steps: ["Step 1 detail", "Step 2 detail", "Step 3 detail"]
      },
      {
        title: "Strategy focusing on mental techniques",
        description: "Using breathing and visualization to improve performance",
        steps: ["Step 1 detail", "Step 2 detail", "Step 3 detail"]
      }
    ],
    'interviewing': [
      {
        title: "Strategy focusing on practice and preparation",
        description: "How practice builds interview confidence",
        steps: ["Step 1 detail", "Step 2 detail", "Step 3 detail"]
      },
      {
        title: "Strategy focusing on documenting achievements",
        description: "Creating reference material for interviews",
        steps: ["Step 1 detail", "Step 2 detail", "Step 3 detail"]
      },
      {
        title: "Strategy focusing on mindset shift",
        description: "Reframing how you think about interviews",
        steps: ["Step 1 detail", "Step 2 detail", "Step 3 detail"]
      }
    ],
    'pitch-ideas': [
      {
        title: "Strategy focusing on practice and delivery",
        description: "Rehearsing until natural and confident",
        steps: ["Step 1 detail", "Step 2 detail", "Step 3 detail"]
      },
      {
        title: "Strategy focusing on purpose and passion",
        description: "Connecting with your core motivation",
        steps: ["Step 1 detail", "Step 2 detail", "Step 3 detail"]
      },
      {
        title: "Strategy focusing on preparation for questions",
        description: "Being ready for any challenge",
        steps: ["Step 1 detail", "Step 2 detail", "Step 3 detail"]
      }
    ],
    'self-doubt': [
      {
        title: "Strategy focusing on tracking achievements",
        description: "Documenting evidence to counter negative self-talk",
        steps: ["Step 1 detail", "Step 2 detail", "Step 3 detail"]
      },
      {
        title: "Strategy focusing on self-compassion",
        description: "Treating yourself with the kindness you'd show a friend",
        steps: ["Step 1 detail", "Step 2 detail", "Step 3 detail"]
      },
      {
        title: "Strategy focusing on evidence-based confidence",
        description: "Building confidence based on concrete facts",
        steps: ["Step 1 detail", "Step 2 detail", "Step 3 detail"]
      }
    ]
  };
  
  // Get the structure template for this issue
  const templateStructure = strategyStructure[issueId] || [];
  
  try {
    // Build a prompt to generate strategies
    const strategiesPrompt = [
      {
        role: "system",
        content: `You are a professional confidence buddy specializing in helping people overcome ${issueId} challenges.
        
        Your task is to create 3 powerful, practical strategies to help someone build confidence in this area.
        
        For each strategy, include:
        1. An engaging, action-oriented title (5-6 words maximum)
        2. A brief description (1 sentence only, focusing on benefits)
        3. 3 specific, actionable steps for implementing the strategy
        
        Your strategies should align with the themes provided in the user's message.
        Make each strategy distinct and focused on a different aspect of building confidence.
        Use warm, encouraging language that sounds like advice from a supportive friend.
        
        Format your response as valid JSON that follows this exact structure:
        [
          {
            "title": "Strategy Title",
            "description": "Brief description focusing on benefits.",
            "steps": ["Specific step 1", "Specific step 2", "Specific step 3"]
          },
          {
            "title": "Strategy Title",
            "description": "Brief description focusing on benefits.",
            "steps": ["Specific step 1", "Specific step 2", "Specific step 3"]
          },
          {
            "title": "Strategy Title",
            "description": "Brief description focusing on benefits.",
            "steps": ["Specific step 1", "Specific step 2", "Specific step 3"]
          }
        ]`
      },
      {
        role: "user",
        content: `Please create 3 confidence-building strategies for ${issueId} challenges.
        
        The strategies should focus on these themes:
        ${templateStructure.map(template => `- ${template.title}`).join('\n')}
        
        Remember to make each strategy practical, specific, and encouraging.`
      }
    ];
    
    // Call the Azure OpenAI API to generate strategies
    const generatedStrategiesText = await callAzureOpenAI(strategiesPrompt);
    
    // Parse the JSON response
    let strategies = [];
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedStrategiesText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        strategies = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract JSON from response");
      }
    } catch (parseError) {
      console.error("Error parsing AI-generated strategies:", parseError);
      // Fall back to manually extracting strategies using regex
      const strategyMatches = generatedStrategiesText.match(/title"?\s*:\s*"([^"]+)"[\s\S]*?description"?\s*:\s*"([^"]+)"[\s\S]*?steps"?\s*:\s*\[([\s\S]*?)\]/g);
      
      if (strategyMatches && strategyMatches.length > 0) {
        strategies = strategyMatches.map(match => {
          const titleMatch = match.match(/title"?\s*:\s*"([^"]+)"/);
          const descriptionMatch = match.match(/description"?\s*:\s*"([^"]+)"/);
          const stepsMatch = match.match(/steps"?\s*:\s*\[([\s\S]*?)\]/);
          
          const title = titleMatch ? titleMatch[1] : "Strategy Title";
          const description = descriptionMatch ? descriptionMatch[1] : "Strategy description";
          const stepsString = stepsMatch ? stepsMatch[1] : "";
          const steps = stepsString.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || 
                        ["Step 1", "Step 2", "Step 3"];
          
          return {
            title,
            description,
            steps: steps.slice(0, 3) // Ensure we have exactly 3 steps
          };
        });
      }
    }
    
    // If strategies couldn't be parsed or are incomplete, use fallback
    if (!strategies || strategies.length < 3) {
      // Create fallback strategies based on the template
      strategies = templateStructure.map((template, index) => {
        // Try to use any successfully parsed strategies first
        if (strategies && strategies[index]) {
          return strategies[index];
        }
        
        // Otherwise use a fallback
        return {
          title: template.title.replace("Strategy focusing on ", ""),
          description: template.description,
          steps: [
            `Start by ${template.steps[0].replace("Step 1 detail", "taking small steps")}`,
            `Then ${template.steps[1].replace("Step 2 detail", "practice regularly")}`,
            `Finally ${template.steps[2].replace("Step 3 detail", "review and improve")}`
          ]
        };
      });
    }
    
    // Ensure we have exactly 3 strategies with all required fields
    const validatedStrategies = strategies.slice(0, 3).map((strategy, index) => {
      return {
        title: strategy.title || templateStructure[index].title.replace("Strategy focusing on ", ""),
        description: strategy.description || templateStructure[index].description,
        steps: (strategy.steps || []).slice(0, 3).map((step, stepIndex) => 
          step || templateStructure[index].steps[stepIndex].replace("Step " + (stepIndex + 1) + " detail", "take action")
        )
      };
    });
    
    // Store in cache for future use
    strategyCache[issueId] = validatedStrategies;
    
    return validatedStrategies;
  } catch (error) {
    console.error("Error generating strategies:", error);
    
    // If any error occurs, fall back to template-based strategies
    const fallbackStrategies = templateStructure.map(template => {
      return {
        title: template.title.replace("Strategy focusing on ", ""),
        description: template.description,
        steps: [
          `Start by ${template.steps[0].replace("Step 1 detail", "taking small steps")}`,
          `Then ${template.steps[1].replace("Step 2 detail", "practice regularly")}`,
          `Finally ${template.steps[2].replace("Step 3 detail", "review and improve")}`
        ]
      };
    });
    
    // Store in cache for future use
    strategyCache[issueId] = fallbackStrategies;
    
    return fallbackStrategies;
  }
};
  // Handle issue selection
  const handleSelectIssue = (issue) => {
    setSelectedIssue(issue);
    setStep('questions');
    setCurrentQuestion(0);
    setResponses({});
    setMultiChoiceSelected(null);
  };

  // Handle multiple choice selection
  const handleMultiChoiceSelect = (option) => {
    setMultiChoiceSelected(option);
  };

  // Handle response to questions
  const handleResponseSubmit = () => {
    const currentQuestionObj = getQuestions(selectedIssue.id)[currentQuestion];
    let responseValue = "";
    
    if (currentQuestionObj.type === "multiChoice") {
      if (!multiChoiceSelected) return;
      responseValue = multiChoiceSelected;
    } else {
      if (!userInput.trim()) return;
      responseValue = userInput;
    }
    
    const newResponses = {...responses};
    newResponses[currentQuestion] = responseValue;
    setResponses(newResponses);
    setUserInput('');
    setMultiChoiceSelected(null);
    
    if (currentQuestion < getQuestions(selectedIssue.id).length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, move to analysis
      setLoadingState('analysis');
      setStep('analysis');
      // Call Azure OpenAI
      generateAnalysisWithAzureOpenAI();
    }
  };

  // Function to call Azure OpenAI API
  const callAzureOpenAI = async (messages) => {
    try {
      const response = await fetch(`${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2023-05-15`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_KEY
        },
        body: JSON.stringify({
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Azure OpenAI:', error);
      return "I'm sorry, there was an error analyzing your responses. Please try again later.";
    }
  };

  // Generate analysis using Azure OpenAI but blend with predefined strategies
// Modified function to work with AI-generated strategies

const generateAnalysisWithAzureOpenAI = async () => {
  // Prepare the questions and answers for the AI
  const questions = getQuestions(selectedIssue.id);
  const questionsAndAnswers = Object.keys(responses).map(key => {
    return `Question: ${questions[key].text}
Answer: ${responses[key]}`;
  }).join('\n\n');

  // Set loading state for analysis
  setLoadingState('analysis');

  // Create prompt for analysis
  const analysisPrompt = [
    {
      role: "system",
      content: `You are a supportive, encouraging Confidence buddy who specializes in helping people overcome ${selectedIssue.title}. 
      Your tone is warm, conversational, and friendly - like a supportive friend rather than a clinical professional.
      
      When analyzing responses:
      1. Use a warm, personal tone with phrases like "I'm noticing..." or "It sounds like..."
      2. Acknowledge their feelings and validate their experiences
      3. Frame challenges as opportunities for growth
      4. Focus on 2-3 key insights that will be most helpful
      5. Include specific details from their responses to show you're really listening
      6. End with a note of genuine encouragement that builds hope
      
      Avoid:
      - Clinical or overly formal language
      - Generic advice that could apply to anyone
      - Focusing too much on problems without offering hope
      
      Your response should read like a message from a supportive friend who truly cares.`
    },
    {
      role: "user",
      content: `I'm seeking help with my ${selectedIssue.title.toLowerCase()} challenges. Here are my responses to your questions:\n\n${questionsAndAnswers}\n\nCan you analyze my responses and help me understand what might be going on?`
    }
  ];

  try {
    // Get analysis from Azure OpenAI
    const analysisText = await callAzureOpenAI(analysisPrompt);
    setAnalysis(analysisText);
    
    // First get AI-generated strategies
    const strategies = await getPredefinedStrategies(selectedIssue.id);
    
    // Update loading state for personalizing solutions
    setLoadingState('solutions');
    
    // Create prompt for personalizing the AI-generated strategies
    const solutionsPrompt = [
      {
        role: "system",
        content: `You are a supportive, encouraging Confidence buddy who specializes in helping people overcome ${selectedIssue.title}.
        
        You'll be given:
        1. A user's responses to questions about their ${selectedIssue.title.toLowerCase()} challenges
        2. A set of confidence-building strategies
        
        Your task is to write a SINGLE personalized note for EACH strategy that:
        - Directly connects the strategy to something specific the user mentioned
        - Explains why this strategy will be particularly helpful for their unique situation
        - Uses a warm, encouraging tone like a supportive friend
        - Is brief (2-3 sentences max) but specific to their situation
        
        For example, instead of "This strategy will help you overcome your challenges", 
        say something like "Since you mentioned feeling your heart race when speaking to groups, 
        this breathing technique will be especially helpful for managing those physical symptoms."
        
        Format each note as:
        
        STRATEGY 1: [Your personalized note for the first strategy]
        
        STRATEGY 2: [Your personalized note for the second strategy]
        
        STRATEGY 3: [Your personalized note for the third strategy]`
      },
      {
        role: "user",
        content: `Here are my responses about my ${selectedIssue.title.toLowerCase()} challenges:\n\n${questionsAndAnswers}\n\n
        Please write a brief personalized note for each of these strategies to explain how it specifically relates to my situation:
        
        ${strategies.map((strategy, index) => 
          `STRATEGY ${index + 1}: ${strategy.title}
          Description: ${strategy.description}
          Steps: ${strategy.steps.join(', ')}`
        ).join('\n\n')}`
      }
    ];

    // Get personalized notes from Azure OpenAI
    const personalizedResponse = await callAzureOpenAI(solutionsPrompt);
    
    // Extract personalized notes using regex
    const personalizedNotes = [];
    
    // Simple extraction - look for patterns like "STRATEGY 1:" or "Strategy 1:" followed by text
    const noteRegex = /(?:STRATEGY|Strategy)\s*(\d+)(?::|-)?\s*([\s\S]*?)(?=(?:STRATEGY|Strategy)\s*\d+|$)/gi;
    let match;
    while ((match = noteRegex.exec(personalizedResponse)) !== null) {
      const strategyIndex = parseInt(match[1]) - 1;
      let noteText = match[2].trim();
      
      // Clean up the note to remove any prefixes like "Personalized Note:" or "Note:"
      noteText = noteText.replace(/^(Personalized Note|Note|Personal Note)(?::|-)?\s*/i, '');
      
      // Store the note with its strategy index
      personalizedNotes[strategyIndex] = noteText;
    }
    
    // If parsing failed, create fallback notes that are more specific to each strategy
    if (personalizedNotes.length === 0) {
      strategies.forEach((strategy, index) => {
        if (index === 0) {
          personalizedNotes[index] = `This approach will help you build confidence step by step, starting with the specific challenges you mentioned.`;
        } else if (index === 1) {
          personalizedNotes[index] = `Based on what you shared, this strategy will help you overcome the concerns you expressed about ${selectedIssue.title.toLowerCase()}.`;
        } else {
          personalizedNotes[index] = `This strategy directly addresses the specific challenges you mentioned and will help you build lasting confidence.`;
        }
      });
    }
    
    // Create personalized solutions based on the AI-generated ones
    const personalizedStrategies = strategies.map((strategy, index) => {
      return {
        ...strategy,
        personalNote: personalizedNotes[index] || 
          `This ${strategy.title.toLowerCase()} approach directly addresses the challenges you described.`
      };
    });
    
    setSolutions(personalizedStrategies);
    setLoadingState('');
  } catch (error) {
    console.error('Error in analysis process:', error);
    setAnalysis("I'm sorry, I couldn't complete the analysis at this time. Please try again later.");
    
    // Try to get strategies or use fallback
    try {
      const fallbackStrategies = await getPredefinedStrategies(selectedIssue.id);
      setSolutions(fallbackStrategies);
    } catch (strategyError) {
      console.error('Error getting fallback strategies:', strategyError);
    }
    
    setLoadingState('');
  }
};

  // Progress to solutions after analysis
  const handleViewSolutions = () => {
    setStep('solutions');
  };

  // Return to start
  const handleReset = () => {
    setStep('select');
    setSelectedIssue(null);
    setResponses({});
    setCurrentQuestion(0);
    setAnalysis('');
    setSolutions([]);
    setLoadingState('');
  };

  // Custom loading indicator component
  const LoadingSpinner = ({ message }) => (
    <div className="flex flex-col items-center py-10">
      <div className="relative h-12 w-12 mb-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader size={36} className="text-indigo-600 animate-spin" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <Brain size={24} className="text-indigo-800" />
        </div>
      </div>
      <p className="mt-2 text-gray-600 font-medium">{message}</p>
      <div className="mt-4 bg-indigo-100 rounded-full h-2 w-48">
        <div className="bg-indigo-600 h-2 rounded-full animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center">
            <Sparkles className="mr-2" size={28} />
            Confidence buddy
          </h1>
          <button 
            onClick={handleReset}
            className="p-2 rounded-full hover:bg-white/10 transition-all"
            title="Start Over"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4 md:p-6 max-w-4xl">
        {/* Welcome Message */}
        {step === 'select' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-indigo-500">
            <div className="flex items-start mb-4">
              <div className="p-3 bg-indigo-100 rounded-full mr-4">
                <MessageCircle size={24} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-indigo-800">Hey there, friend!</h2>
                <p className="text-gray-700 mt-2">
                  I'm so glad you're here! Think of me as your personal confidence buddy - ready to cheer you on, help you spot any challenges you might be facing, and share uplifting tips and suggestions to help you grow, shine, and feel your best. Let's do this together!
                </p>
              </div>
            </div>
            <h3 className="text-lg font-medium text-indigo-700 mb-3 mt-6">What confidence challenge can I help you with today?</h3>
          </div>
        )}

        {/* Issue Selection */}
        {step === 'select' && (
          <div className="grid md:grid-cols-2 gap-5">
            {confidenceIssues.map((issue) => (
              <div 
                key={issue.id}
                onClick={() => handleSelectIssue(issue)}
                className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-indigo-400 transform hover:-translate-y-1"
              >
                <div className="flex items-start">
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mr-4 text-indigo-600">
                    {issue.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-indigo-700">{issue.title}</h3>
                    <p className="text-gray-600 mt-1">{issue.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Questions */}
        {step === 'questions' && selectedIssue && (
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mr-4 text-indigo-600">
                {selectedIssue.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-indigo-800">
                  {selectedIssue.title}
                </h2>
                <p className="text-sm text-gray-500">
                  Let's understand your unique situation better
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-500 text-sm">
                Question {currentQuestion + 1} of {getQuestions(selectedIssue.id).length}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-indigo-600 to-purple-500 h-2 rounded-full transition-all" 
                  style={{width: `${((currentQuestion + 1) / getQuestions(selectedIssue.id).length) * 100}%`}}
                ></div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-6 text-gray-800">
              {getQuestions(selectedIssue.id)[currentQuestion]?.text}
            </h3>

            {getQuestions(selectedIssue.id)[currentQuestion]?.type === "multiChoice" ? (
              <div className="space-y-3 mb-6">
                {getQuestions(selectedIssue.id)[currentQuestion].options.map((option, index) => (
                  <div 
                    key={index}
                    onClick={() => handleMultiChoiceSelect(option)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      multiChoiceSelected === option 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        multiChoiceSelected === option 
                          ? 'border-indigo-500 bg-indigo-500' 
                          : 'border-gray-300'
                      }`}>
                        {multiChoiceSelected === option && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-gray-800">{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-6">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                  placeholder="Type your answer here..."
                />
              </div>
            )}

            <button 
              onClick={handleResponseSubmit}
              disabled={(getQuestions(selectedIssue.id)[currentQuestion]?.type === "multiChoice" && !multiChoiceSelected) || 
                        (getQuestions(selectedIssue.id)[currentQuestion]?.type === "text" && !userInput.trim())}
              className={`w-full py-3 px-6 rounded-lg flex items-center justify-center font-medium transition-all ${
                ((getQuestions(selectedIssue.id)[currentQuestion]?.type === "multiChoice" && !multiChoiceSelected) || 
                (getQuestions(selectedIssue.id)[currentQuestion]?.type === "text" && !userInput.trim()))
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90'
              }`}
            >
              <span>Continue</span>
              <ArrowRight size={18} className="ml-2" />
            </button>

            {getQuestions(selectedIssue.id)[currentQuestion]?.type === "text" && (
              <div className="mt-4 text-sm text-gray-500 flex items-center justify-center">
                <Mic size={16} className="mr-2" />
                <span>Or click to use voice input</span>
              </div>
            )}
          </div>
        )}

        {/* Analysis */}
        {step === 'analysis' && (
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mr-4 text-indigo-600">
                <Brain size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-indigo-800">Your Confidence Analysis</h2>
                <p className="text-sm text-gray-500">Personalized insights based on your responses</p>
              </div>
            </div>

            {loadingState === 'analysis' ? (
              <LoadingSpinner message="Analyzing your responses..." />
            ) : loadingState === 'solutions' ? (
              <>
                <div className="bg-indigo-50 p-6 rounded-lg mb-6 border-l-4 border-indigo-500">
                  <p className="text-gray-800 leading-relaxed">{<FormattedMessage content={analysis}/>}</p>
                </div>
                
                <LoadingSpinner message="Creating your personalized confidence plan..." />
              </>
            ) : (
              <>
                <div className="bg-indigo-50 p-6 rounded-lg mb-6 border-l-4 border-indigo-500">
                  <p className="text-gray-800 leading-relaxed">{<FormattedMessage content={analysis}/>}</p>
                </div>
                
                <button 
                  onClick={handleViewSolutions}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg hover:opacity-90 transition-all flex items-center justify-center font-medium"
                >
                  <span>View Your Confidence Plan</span>
                  <ArrowRight size={18} className="ml-2" />
                </button>
                </>
            )}
          </div>
        )}

        {/* Solutions */}
        {step === 'solutions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mr-4 text-indigo-600">
                  <Lightbulb size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-indigo-800">Your Personalized Confidence Plan</h2>
                  <p className="text-sm text-gray-500">Strategies tailored to your specific needs</p>
                </div>
              </div>

              <p className="text-gray-700 mb-8 leading-relaxed">
                Based on your responses, I've created a personalized confidence plan just for you.
                These strategies are designed to help you overcome your specific challenges and build
                lasting confidence in {selectedIssue.title.toLowerCase()}.
              </p>

              <div className="space-y-8 mb-8">
                {solutions.map((solution, index) => (
                  <div key={index} className="relative">
                    {/* Strategy card with gradient border */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-md relative z-10">
                      {/* Badge with strategy number */}
                      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                        {index + 1}
                      </div>
                      
                      <div className="pt-2">
                        <h3 className="font-bold text-xl text-indigo-700 mb-2">{solution.title}</h3>
                        <p className="text-gray-700 mb-4">{solution.description}</p>
                        
                        {/* Personalized note */}
                        {solution.personalNote && (
                          <div className="bg-purple-50 p-4 rounded-lg mb-4 border-l-3 border-purple-400 text-sm text-gray-700 italic">
                            {solution.personalNote}
                          </div>
                        )}
                        
                        <h4 className="font-medium text-indigo-600 mb-3">Action Steps:</h4>
                        <ul className="space-y-3">
                          {solution.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start">
                              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full p-1 mr-3 mt-1">
                                <span className="flex h-5 w-5 items-center justify-center text-xs text-indigo-800 font-bold">
                                  {stepIndex + 1}
                                </span>
                              </div>
                              <span className="text-gray-800">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Decorative gradient background */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-10"></div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <button 
                    onClick={handleReset} 
                    className="bg-white border border-indigo-500 text-indigo-700 py-3 px-6 rounded-lg hover:bg-indigo-50 transition-all flex-1 flex items-center justify-center"
                  >
                    <RefreshCw size={18} className="mr-2" />
                    <span>Start New Assessment</span>
                  </button>
                  
                  <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:opacity-90 transition-all flex-1 flex items-center justify-center">
                    <ThumbsUp size={18} className="mr-2" />
                    <span>Save My Plan</span>
                  </button>
                </div>
                
                <div className="mt-6 bg-indigo-50 p-4 rounded-lg flex items-start">
                  <HelpCircle size={20} className="text-indigo-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    Would you like additional resources for {selectedIssue.title.toLowerCase()}? 
                    Check out our <span className="text-indigo-600 font-medium">Resource Library</span> or 
                    schedule a <span className="text-indigo-600 font-medium">Practice Session</span> with a confidence buddy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Sparkles className="text-indigo-600 mr-2" size={20} />
            <span className="text-gray-700 font-medium">Confidence buddy</span>
          </div>
          
          <div className="text-gray-500 text-sm">
            &copy; 2025 Martial Technologies • All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ConfidenceCoach;