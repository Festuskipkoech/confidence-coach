import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Brain, 
  Lightbulb,
  CheckCircle,
  Clock,
  Users,
  Briefcase,
  Presentation,
  Sparkles,
  Target,
  BarChart3
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

import api from '../services/api';
import { FormattedMessage } from '../components/FormattedMessage';

// Helper functions
const getIssueIcon = (issueType) => {
  const iconMap = {
    'public-speaking': Users,
    'interviewing': Briefcase,
    'pitch-ideas': Presentation,
    'self-doubt': Brain
  };
  const IconComponent = iconMap[issueType] || Brain;
  return <IconComponent className="w-6 h-6" />;
};

const getIssueColor = (issueType) => {
  const colorMap = {
    'public-speaking': 'from-blue-500 to-purple-600',
    'interviewing': 'from-green-500 to-blue-500',
    'pitch-ideas': 'from-orange-500 to-red-500',
    'self-doubt': 'from-purple-500 to-pink-500'
  };
  return colorMap[issueType] || 'from-gray-500 to-gray-600';
};

// Assessment List Component
const AssessmentsList = () => {
  const navigate = useNavigate();
  
const { data: assessments, isLoading } = useQuery({
  queryKey: ['assessments'],
  queryFn: () => api.get('/assessments/').then(res => res.data)
});

const { data: confidenceIssues } = useQuery({
  queryKey: ['confidence-issues'],
  queryFn: () => api.get('/assessments/confidence-issues').then(res => res.data)
});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading assessments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Assessments</h1>
          <p className="text-gray-600 mt-2">Track your confidence journey and view your progress</p>
        </div>
        <button
          onClick={() => navigate('/assessments/new')}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">New Assessment</span>
        </button>
      </div>

      {/* Quick Start Cards - Show when no assessments */}
      {(!assessments || assessments.length === 0) && confidenceIssues && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Start Your First Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {confidenceIssues.map((issue) => (
              <motion.div
                key={issue.id}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/assessments/new?type=${issue.id}`)}
              >
                <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-200 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${getIssueColor(issue.id)} opacity-0 group-hover:opacity-5 transition-opacity duration-200`}></div>
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getIssueColor(issue.id)} text-white flex items-center justify-center mb-4`}>
                      {getIssueIcon(issue.id)}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{issue.title}</h3>
                    <p className="text-sm text-gray-600">{issue.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Assessments List */}
      {assessments && assessments.length > 0 ? (
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getIssueColor(assessment.issue_type)} text-white flex items-center justify-center`}>
                      {getIssueIcon(assessment.issue_type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{assessment.issue_title}</h3>
                      <p className="text-sm text-gray-600">
                        Created {format(new Date(assessment.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {assessment.status === 'completed' ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Completed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-700">In Progress</span>
                        </>
                      )}
                    </div>
                    
                    <button
                      onClick={() => navigate(`/assessments/${assessment.id}`)}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                    >
                      <span>{assessment.status === 'completed' ? 'View Results' : 'Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No assessments yet</h3>
          <p className="text-gray-600 mb-6">Start your confidence journey by taking your first assessment</p>
          <button
            onClick={() => navigate('/assessments/new')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Start Your First Assessment
          </button>
        </div>
      )}
    </div>
  );
};

// New Assessment Component
const NewAssessment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [userInput, setUserInput] = useState('');
  const [multiChoiceSelected, setMultiChoiceSelected] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

const { data: confidenceIssues } = useQuery({
  queryKey: ['confidence-issues'],
  queryFn: () => api.get('/assessments/confidence-issues').then(res => res.data)
});

const { data: questions } = useQuery({
  queryKey: ['questions', selectedIssue?.id],
  queryFn: () => api.get(`/assessments/questions/${selectedIssue.id}`).then(res => res.data),
  enabled: !!selectedIssue?.id
});
const createAssessmentMutation = useMutation({
  mutationFn: (data) => api.post('/assessments/', data),
  onSuccess: (response) => {
    setCurrentAssessment(response.data);
    queryClient.invalidateQueries({ queryKey: ['assessments'] });
  },
  onError: () => toast.error('Failed to create assessment')
});

const completeAssessmentMutation = useMutation({
  mutationFn: ({ assessmentId, responses }) => 
    api.post(`/assessments/${assessmentId}/complete`, responses),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['assessments'] });
    toast.success('Assessment completed! 🎉');
    navigate(`/assessments/${currentAssessment.id}`);
  },
  onError: () => {
    toast.error('Failed to complete assessment');
    setIsAnalyzing(false);
  }
});

  // Check for pre-selected issue type from URL params
  useEffect(() => {
    const issueType = searchParams.get('type');
    if (issueType && confidenceIssues) {
      const issue = confidenceIssues.find(i => i.id === issueType);
      if (issue) {
        handleIssueSelect(issue);
      }
    }
  }, [searchParams, confidenceIssues]);

  const handleIssueSelect = async (issue) => {
    setSelectedIssue(issue);
    try {
      await createAssessmentMutation.mutateAsync({
        issue_type: issue.id,
        issue_title: issue.title
      });
    } catch (error) {
      console.error('Failed to create assessment:', error);
    }
  };

  const handleResponseSubmit = () => {
    if (!questions || !questions[currentQuestion]) return;
    
    const currentQuestionObj = questions[currentQuestion];
    let responseValue = "";
    
    if (currentQuestionObj.type === "multiChoice") {
      if (!multiChoiceSelected) return;
      responseValue = multiChoiceSelected;
    } else {
      if (!userInput.trim()) return;
      responseValue = userInput;
    }
    
    const newResponses = { ...responses };
    newResponses[currentQuestion] = responseValue;
    setResponses(newResponses);
    setUserInput('');
    setMultiChoiceSelected(null);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleCompleteAssessment(newResponses);
    }
  };

  const handleCompleteAssessment = async (finalResponses) => {
    if (!currentAssessment) return;
    
    setIsAnalyzing(true);
    try {
      await completeAssessmentMutation.mutateAsync({
        assessmentId: currentAssessment.id,
        responses: finalResponses
      });
    } catch (error) {
      console.error('Assessment completion error:', error);
    }
  };

  // Issue Selection Step
  if (!selectedIssue) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/assessments')}
            className="flex items-center text-purple-600 hover:text-purple-700 font-medium mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Assessments
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Assessment</h1>
          <p className="text-gray-600">Choose the confidence area you'd like to work on</p>
        </div>

        {confidenceIssues && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {confidenceIssues.map((issue) => (
              <motion.div
                key={issue.id}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group cursor-pointer"
                onClick={() => handleIssueSelect(issue)}
              >
                <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${getIssueColor(issue.id)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getIssueColor(issue.id)} text-white flex items-center justify-center mb-6`}>
                      {getIssueIcon(issue.id)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800">
                      {issue.title}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-700 leading-relaxed">
                      {issue.description}
                    </p>
                    <div className="mt-6 flex items-center text-purple-600 group-hover:text-purple-700 font-medium">
                      <span>Get Started</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Analysis Loading State
  if (isAnalyzing) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyzing Your Responses</h2>
          <p className="text-gray-600 mb-8">
            Our AI is creating your personalized confidence plan and strategies...
          </p>
          
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-center space-x-3 opacity-100">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span className="text-gray-700">Processing your responses</span>
            </div>
            <div className="flex items-center space-x-3 opacity-75">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-gray-600">Generating personalized analysis</span>
            </div>
            <div className="flex items-center space-x-3 opacity-50">
              <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
              <span className="text-gray-500">Creating confidence strategies</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Questions Step
  if (selectedIssue && questions && currentAssessment && !isAnalyzing) {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const currentQuestionObj = questions[currentQuestion];

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => {
              setSelectedIssue(null);
              setCurrentAssessment(null);
              setCurrentQuestion(0);
              setResponses({});
            }}
            className="flex items-center text-purple-600 hover:text-purple-700 font-medium mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Change Assessment Type
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${getIssueColor(selectedIssue.id)} text-white mr-4`}>
              {getIssueIcon(selectedIssue.id)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedIssue.title}</h2>
              <p className="text-gray-600">Let's understand your unique situation</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-purple-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-6 text-gray-800 leading-relaxed">
              {currentQuestionObj.text}
            </h3>

            {currentQuestionObj.type === "multiChoice" ? (
              <div className="space-y-3 mb-8">
                {currentQuestionObj.options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => setMultiChoiceSelected(option)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      multiChoiceSelected === option 
                        ? 'border-purple-500 bg-purple-50 shadow-lg' 
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        multiChoiceSelected === option 
                          ? 'border-purple-500 bg-purple-500' 
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
              <div className="mb-8">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 min-h-[120px] transition-colors"
                  placeholder="Share your thoughts here..."
                />
              </div>
            )}

            {/* Submit Button */}
            <button 
              onClick={handleResponseSubmit}
              disabled={
                (currentQuestionObj.type === "multiChoice" && !multiChoiceSelected) || 
                (currentQuestionObj.type === "text" && !userInput.trim())
              }
              className={`w-full py-4 px-6 rounded-xl flex items-center justify-center font-medium transition-all ${
                ((currentQuestionObj.type === "multiChoice" && !multiChoiceSelected) || 
                (currentQuestionObj.type === "text" && !userInput.trim()))
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <span>
                {currentQuestion === questions.length - 1 ? 'Complete Assessment' : 'Continue'}
              </span>
              {currentQuestion === questions.length - 1 ? (
                <Send className="w-5 h-5 ml-2" />
              ) : (
                <ArrowRight className="w-5 h-5 ml-2" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Assessment Results Component
const AssessmentResults = ({ assessmentId }) => {
  const navigate = useNavigate();
  

const { data: assessment, isLoading } = useQuery({
  queryKey: ['assessment', assessmentId],
  queryFn: () => api.get(`/assessments/${assessmentId}`).then(res => res.data),
  enabled: !!assessmentId
});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading assessment results...</span>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment not found</h2>
        <p className="text-gray-600 mb-8">The assessment you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/assessments')}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Assessments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/assessments')}
          className="flex items-center text-purple-600 hover:text-purple-700 font-medium mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Assessments
        </button>
      </div>

      {/* Assessment Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className={`p-4 rounded-xl bg-gradient-to-r ${getIssueColor(assessment.issue_type)} text-white mr-6`}>
            {getIssueIcon(assessment.issue_type)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{assessment.issue_title}</h1>
            <p className="text-gray-600">
              Completed on {format(new Date(assessment.completed_at || assessment.created_at), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>

        {assessment.status === 'completed' && (
          <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Assessment Completed</span>
          </div>
        )}
      </div>

      {/* Analysis Section */}
      {assessment.analysis && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-purple-100 rounded-xl mr-4">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Confidence Analysis</h2>
              <p className="text-gray-600">Personalized insights based on your responses</p>
            </div>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
            <FormattedMessage content={assessment.analysis} />
          </div>
        </div>
      )}

      {/* Strategies Section */}
      {assessment.strategies && assessment.strategies.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center mb-8">
            <div className="p-3 bg-indigo-100 rounded-xl mr-4">
              <Lightbulb className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Confidence Strategies</h2>
              <p className="text-gray-600">Personalized action plan to build your confidence</p>
            </div>
          </div>

          <div className="space-y-8">
            {assessment.strategies.map((strategy, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm relative z-10">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="font-bold text-xl text-gray-900 mb-3">{strategy.title}</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">{strategy.description}</p>
                    
                    {strategy.personal_note && (
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg mb-6">
                        <p className="text-purple-800 italic text-sm leading-relaxed">
                          💡 {strategy.personal_note}
                        </p>
                      </div>
                    )}
                    
                    <h4 className="font-semibold text-purple-700 mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Action Steps:
                    </h4>
                    
                    <div className="space-y-3">
                      {strategy.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start">
                          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full p-2 mr-4 mt-1 flex-shrink-0">
                            <span className="flex h-5 w-5 items-center justify-center text-xs text-purple-800 font-bold">
                              {stepIndex + 1}
                            </span>
                          </div>
                          <p className="text-gray-800 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-300 to-indigo-300 rounded-xl blur opacity-10"></div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/assessments/new')}
                className="bg-white border-2 border-purple-500 text-purple-700 py-3 px-6 rounded-xl hover:bg-purple-50 transition-all flex-1 flex items-center justify-center font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span>Take Another Assessment</span>
              </button>
              
              <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all flex-1 flex items-center justify-center font-medium">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Track My Progress</span>
              </button>
            </div>
            
            <div className="mt-6 bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex items-start">
              <Lightbulb className="w-5 h-5 text-indigo-600 mr-3 mt-1 flex-shrink-0" />
              <p className="text-sm text-indigo-800">
                <strong>Pro Tip:</strong> Practice these strategies consistently for the best results. 
                Small daily actions lead to big confidence breakthroughs! 🌟
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Assessments Page Component
const AssessmentsPage = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Route logic based on URL path
  if (pathSegments.includes('new')) {
    return <NewAssessment />;
  } else if (pathSegments.length >= 2 && pathSegments[1] !== 'new') {
    const assessmentId = parseInt(pathSegments[1]);
    if (!isNaN(assessmentId)) {
      return <AssessmentResults assessmentId={assessmentId} />;
    }
  }
  
  // Default to assessments list
  return <AssessmentsList />;
};

export default AssessmentsPage;