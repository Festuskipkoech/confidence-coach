import React, { useState } from 'react';
import { Send, Mic, Brain, Users, PresentationIcon, Lightbulb, ArrowRight, Sparkles, Loader } from 'lucide-react';
import { FormattedMessage } from './format';

const ConfidenceCoach = () => {
  const [step, setStep] = useState('select'); // select, questions, analysis, solutions
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [analysis, setAnalysis] = useState('');
  const [solutions, setSolutions] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [loadingState, setLoadingState] = useState(''); // '', 'analysis', 'solutions'
  
  // Azure OpenAI Configuration
  
  // Common confidence issues
  const confidenceIssues = [
    { id: 'public-speaking', title: 'Public Speaking Anxiety', icon: <Users size={24} />, 
      description: 'Fear of speaking in front of groups or audiences' },
    { id: 'pitch-ideas', title: 'Pitching Ideas', icon: <PresentationIcon size={24} />, 
      description: 'Nervousness when presenting business or creative ideas' },
    { id: 'self-doubt', title: 'Self-Doubt', icon: <Brain size={24} />, 
      description: 'Questioning your abilities or worth in professional settings' },
    { id: 'custom', title: 'Other Confidence Issue', icon: <Lightbulb size={24} />, 
      description: 'Describe your specific confidence challenge' }
  ];

  // Questions based on the selected issue
  const getQuestions = (issueId) => {
    const commonQuestions = [
      "How long have you been experiencing this confidence issue?",
      "On a scale of 1-10, how severely does this affect your daily life?",
      "What specific physical symptoms do you experience when facing this situation?",
      "Have you tried any techniques to overcome this challenge before?"
    ];
    
    const specificQuestions = {
      'public-speaking': [
        "What size audience makes you most uncomfortable?",
        "What are you most afraid might happen during a presentation?",
        "Do you feel more comfortable with prepared remarks or improvising?"
      ],
      'pitch-ideas': [
        "Do you feel more anxious about the content of your pitch or the delivery?",
        "What's at stake when you pitch your ideas?",
        "Do you prefer pitching one-on-one or to groups?"
      ],
      'self-doubt': [
        "In what specific situations do you doubt yourself the most?",
        "Can you identify any triggers that increase your self-doubt?",
        "How do you talk to yourself when experiencing self-doubt?"
      ],
      'custom': [
        "Please describe your specific confidence issue in detail.",
        "What situations trigger this confidence issue the most?",
        "What would success look like for you in overcoming this?"
      ]
    };
    
    return [...commonQuestions, ...specificQuestions[issueId]];
  };

  // Handle issue selection
  const handleSelectIssue = (issue) => {
    setSelectedIssue(issue);
    setStep('questions');
    setCurrentQuestion(0);
    setResponses({});
  };

  // Handle response to questions
  const handleResponseSubmit = () => {
    if (!userInput.trim()) return;
    
    const newResponses = {...responses};
    newResponses[currentQuestion] = userInput;
    setResponses(newResponses);
    setUserInput('');
    
    if (currentQuestion < getQuestions(selectedIssue.id).length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, move to analysis
      setLoadingState('analysis');
      setStep('analysis');
      // Call Azure OpenAI instead of using mock data
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

  // Generate analysis using Azure OpenAI
  const generateAnalysisWithAzureOpenAI = async () => {
    // Prepare the questions and answers for the AI
    const questions = getQuestions(selectedIssue.id);
    const questionsAndAnswers = Object.keys(responses).map(key => {
      return `Question: ${questions[key]}
Answer: ${responses[key]}`;
    }).join('\n\n');

    // Create prompt for analysis
    const analysisPrompt = [
      {
        role: "system",
        content: `You are a professional confidence coach specializing in helping people overcome ${selectedIssue.title}. 
        Analyze the user's responses to provide insightful observations about the root causes of their confidence issues.
        Be empathetic but professional. Identify patterns that might be contributing to their challenges.`
      },
      {
        role: "user",
        content: `Please analyze these responses about my ${selectedIssue.title} issue:\n\n${questionsAndAnswers}`
      }
    ];

    try {
      // Get analysis from Azure OpenAI
      const analysisText = await callAzureOpenAI(analysisPrompt);
      setAnalysis(analysisText);
      
      // Update loading state for solutions generation
      setLoadingState('solutions');
      
      // Create prompt for solutions
      const solutionsPrompt = [
        {
          role: "system",
          content: `You are a professional confidence coach specializing in helping people overcome ${selectedIssue.title}.
          Based on the user's responses and your analysis, provide 3 specific, actionable strategies to help them build confidence.
          For each strategy, include:
          1. A clear title
          2. A brief description of the strategy
          3. 3 specific action steps they can take to implement this strategy
          Format as JSON: [{"title": "Strategy Title", "description": "Strategy description", "steps": ["Step 1", "Step 2", "Step 3"]}, {...}]`
        },
        {
          role: "user",
          content: `Based on these responses about my ${selectedIssue.title} issue and your analysis, provide me with personalized solutions:\n\n${questionsAndAnswers}\n\nYour analysis: ${analysisText}`
        }
      ];

      // Get solutions from Azure OpenAI
      const solutionsText = await callAzureOpenAI(solutionsPrompt);
      
      try {
        // Parse JSON response - handling potential formatting issues
        let solutionsList;
        // Find JSON in the response (in case the AI includes additional text)
        const jsonMatch = solutionsText.match(/\[.*\]/s);
        if (jsonMatch) {
          solutionsList = JSON.parse(jsonMatch[0]);
        } else {
          // Try to extract and format the solutions if not in perfect JSON format
          solutionsList = extractSolutionsFromText(solutionsText);
        }
        
        setSolutions(solutionsList);
        setLoadingState('');
      } catch (error) {
        console.error('Error parsing solutions:', error);
        // Create fallback solutions from the text response
        const fallbackSolutions = createFallbackSolutions(solutionsText);
        setSolutions(fallbackSolutions);
        setLoadingState('');
      }
    } catch (error) {
      console.error('Error in analysis process:', error);
      setAnalysis("I'm sorry, I couldn't complete the analysis at this time. Please try again later.");
      setSolutions([
        {
          title: "Communication Techniques",
          description: "Improve your confidence through better communication practices.",
          steps: [
            "Practice expressing your thoughts clearly and concisely",
            "Seek feedback from trusted peers",
            "Gradually increase exposure to challenging situations"
          ]
        }
      ]);
      setLoadingState('');
    }
  };
  
  // Helper function to extract solutions from text when JSON parsing fails
  const extractSolutionsFromText = (text) => {
    const solutions = [];
    // Look for numbered strategies (1., 2., 3., etc.)
    const strategyMatches = text.match(/\d+\.\s+(.*?)(?=\d+\.|$)/gs);
    
    if (strategyMatches && strategyMatches.length > 0) {
      strategyMatches.forEach(strategy => {
        const titleMatch = strategy.match(/\d+\.\s+(.*?)[\n\r]/);
        const title = titleMatch ? titleMatch[1].trim() : "Strategy";
        
        const descriptionMatch = strategy.match(/[\n\r]+(.*?)[\n\r]+(?:Steps|Action)/i);
        const description = descriptionMatch ? descriptionMatch[1].trim() : "A personalized strategy for your needs.";
        
        const stepsMatches = strategy.match(/[•\-\d]+\s+(.*?)(?=[•\-\d]+\s+|$)/gs);
        const steps = stepsMatches 
          ? stepsMatches.map(step => step.replace(/^[•\-\d]+\s+/, '').trim()).slice(0, 3)
          : ["Review the approach", "Practice regularly", "Track your progress"];
        
        solutions.push({ title, description, steps });
      });
    }
    
    // If no solutions were extracted, return a default one
    if (solutions.length === 0) {
      solutions.push({
        title: "Personalized Confidence Strategy",
        description: "A custom approach based on your responses.",
        steps: [
          "Identify specific triggers and practice countering them",
          "Develop a regular practice routine for your confidence skills",
          "Seek feedback and adjust your approach as needed"
        ]
      });
    }
    
    return solutions;
  };
  
  // Helper function to create fallback solutions
  const createFallbackSolutions = (text) => {
    // Try to extract meaningful content from the text
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Find potential strategy titles (look for capitalized phrases or numbered items)
    const titleCandidates = lines.filter(line => 
      (line.match(/^[A-Z]/) && line.length < 50) || 
      line.match(/^\d+\./)
    ).map(line => line.replace(/^\d+\./, '').trim());
    
    const titles = titleCandidates.length >= 3 
      ? titleCandidates.slice(0, 3) 
      : ["Mindfulness Techniques", "Exposure Practice", "Cognitive Reframing"];
    
    return titles.map((title, index) => ({
      title,
      description: `A personalized ${title.toLowerCase()} approach for your confidence needs.`,
      steps: [
        `Identify specific ${title.toLowerCase()} strategies that resonate with you`,
        `Practice these techniques regularly in low-pressure situations`,
        `Gradually apply them in more challenging scenarios as your confidence builds`
      ]
    }));
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center">
            <Sparkles className="mr-2" size={24} />
            Confidence Coach
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4 md:p-6 max-w-4xl">
        {/* Issue Selection */}
        {step === 'select' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-indigo-800 mb-6">What confidence challenge can I help you with?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {confidenceIssues.map((issue) => (
                <div 
                  key={issue.id}
                  onClick={() => handleSelectIssue(issue)}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-indigo-400"
                >
                  <div className="flex items-start">
                    <div className="p-3 bg-indigo-100 rounded-full mr-4">
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
          </div>
        )}

        {/* Questions */}
        {step === 'questions' && selectedIssue && (
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-indigo-800 mb-2">
              {selectedIssue.title}
            </h2>
            <div className="mb-6">
              <p className="text-gray-500 text-sm">
                Question {currentQuestion + 1} of {getQuestions(selectedIssue.id).length}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all" 
                  style={{width: `${((currentQuestion + 1) / getQuestions(selectedIssue.id).length) * 100}%`}}
                ></div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-4 text-gray-800">
              {getQuestions(selectedIssue.id)[currentQuestion]}
            </h3>

            <div className="flex items-center mt-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleResponseSubmit()}
                className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Type your answer..."
              />
              <button 
                onClick={handleResponseSubmit}
                className="bg-indigo-600 text-white p-3 rounded-r-lg hover:bg-indigo-700"
              >
                <Send size={20} />
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-500 flex items-center">
              <Mic size={16} className="mr-2" />
              <span>Or click to use voice input (in a real app)</span>
            </div>
          </div>
        )}

        {/* Analysis */}
        {step === 'analysis' && (
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-indigo-100 rounded-full mr-4">
                <Brain size={24} />
              </div>
              <h2 className="text-xl font-bold text-indigo-800">AI Analysis</h2>
            </div>

            {loadingState === 'analysis' ? (
              <LoadingSpinner message="Analyzing your responses..." />
            ) : loadingState === 'solutions' ? (
              <>
                <div className="bg-indigo-50 p-4 rounded-lg mb-6 border-l-4 border-indigo-500">
                  <p className="text-gray-800">{<FormattedMessage content={analysis}/>}</p>
                </div>
                
                <LoadingSpinner message="Creating your personalized solutions..." />
              </>
            ) : (
              <>
                <div className="bg-indigo-50 p-4 rounded-lg mb-6 border-l-4 border-indigo-500">
                  <p className="text-gray-800">{<FormattedMessage content={analysis}/>}</p>
                </div>
                
                <button 
                  onClick={handleViewSolutions}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                >
                  <span>View Personalized Solutions</span>
                  <ArrowRight size={18} className="ml-2" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Solutions */}
        {step === 'solutions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-indigo-100 rounded-full mr-4">
                  <Lightbulb size={24} />
                </div>
                <h2 className="text-xl font-bold text-indigo-800">Your Personalized Confidence Plan</h2>
              </div>

              <p className="text-gray-700 mb-6">
                Based on your responses, I've created a personalized plan to help you build confidence.
                Here are strategies tailored to your specific challenges:
              </p>

              <div className="space-y-6 mb-8">
                {solutions.map((solution, index) => (
                  <div key={index} className="bg-indigo-50 p-5 rounded-lg">
                    <h3 className="font-bold text-lg text-indigo-700 mb-2">{solution.title}</h3>
                    <p className="text-gray-700 mb-3">{solution.description}</p>
                    <ul className="space-y-2">
                      {solution.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start">
                          <div className="bg-indigo-200 rounded-full p-1 mr-2 mt-1">
                            <span className="flex h-4 w-4 items-center justify-center text-xs text-indigo-800 font-bold">
                              {stepIndex + 1}
                            </span>
                          </div>
                          <span className="text-gray-800">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleReset} 
                  className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 flex-1"
                >
                  Start Over
                </button>
                
                <button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 flex-1 flex items-center justify-center">
                  <span>Schedule Practice Session</span>
                  <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 border-t border-gray-200">
        <div className="container mx-auto text-center text-gray-600 text-sm">
          <p>Built and developed by Martial Technologies • Confidence Coach © 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default ConfidenceCoach;