import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, Send, SkipForward, Clock, Brain, Volume2 } from "lucide-react";
import { toast } from "sonner";

type InterviewType = 'technical' | 'hr' | 'gd';

interface InterviewConfig {
  type: InterviewType;
  resume?: File;
  jobDescription: string;
  experience: string;
  role: string;
}

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface InterviewInterfaceProps {
  config: InterviewConfig;
  onComplete: () => void;
}

export const InterviewInterface = ({ config, onComplete }: InterviewInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const recognitionRef = useRef<any>();

  // Sample questions based on interview type
  const questions: Question[] = config.type === 'technical' ? [
    {
      id: 1,
      question: "Explain the difference between REST and GraphQL APIs. When would you choose one over the other?",
      category: "System Design",
      difficulty: 'medium'
    },
    {
      id: 2,
      question: "How would you optimize a React application for better performance? Discuss at least 3 techniques.",
      category: "Frontend Development",
      difficulty: 'medium'
    },
    {
      id: 3,
      question: "Design a URL shortener service like bit.ly. What are the main components and how would you scale it?",
      category: "System Design",
      difficulty: 'hard'
    },
    {
      id: 4,
      question: "Implement a function to find the longest common subsequence between two strings.",
      category: "Algorithms",
      difficulty: 'hard'
    },
    {
      id: 5,
      question: "Explain database indexing. How does it improve query performance and what are the trade-offs?",
      category: "Database",
      difficulty: 'medium'
    }
  ] : config.type === 'hr' ? [
    {
      id: 1,
      question: "Tell me about yourself and why you're interested in this role.",
      category: "Introduction",
      difficulty: 'easy'
    },
    {
      id: 2,
      question: "Describe a challenging project you worked on. How did you overcome the obstacles?",
      category: "Problem Solving",
      difficulty: 'medium'
    },
    {
      id: 3,
      question: "Where do you see yourself in 5 years? How does this role fit into your career goals?",
      category: "Career Goals",
      difficulty: 'easy'
    },
    {
      id: 4,
      question: "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
      category: "Teamwork",
      difficulty: 'medium'
    },
    {
      id: 5,
      question: "What motivates you at work? How do you handle stress and pressure?",
      category: "Motivation",
      difficulty: 'easy'
    }
  ] : [
    {
      id: 1,
      question: "Should remote work be permanent post-pandemic? Discuss the pros and cons for both employees and employers.",
      category: "Current Affairs",
      difficulty: 'medium'
    },
    {
      id: 2,
      question: "Is social media doing more harm than good to society? Present your arguments.",
      category: "Technology & Society",
      difficulty: 'medium'
    },
    {
      id: 3,
      question: "Climate change vs Economic growth - can developing countries balance both? What should be the priority?",
      category: "Environment",
      difficulty: 'hard'
    },
    {
      id: 4,
      question: "Should artificial intelligence replace human jobs? Discuss the implications for the future workforce.",
      category: "Technology",
      difficulty: 'hard'
    },
    {
      id: 5,
      question: "Education system reform - what changes are needed to prepare students for the modern workplace?",
      category: "Education",
      difficulty: 'medium'
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer(prev => prev + transcript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast.error('Speech recognition error. Please try again.');
      };
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      toast.success('Recording started');
    }
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim()) {
      toast.error('Please provide an answer before submitting');
      return;
    }

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    
    // Simulate scoring (in real app, this would be AI-powered)
    const questionScore = Math.floor(Math.random() * 3) + 7; // Random score between 7-10
    setCurrentScore(prev => prev + questionScore);
    
    toast.success(`Answer submitted! Score: ${questionScore}/10`);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
    } else {
      // Interview completed
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const skipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setAnswers(prev => [...prev, '']);
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
      toast.info('Question skipped');
    }
  };

  const speakQuestion = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getInterviewTypeTitle = () => {
    switch (config.type) {
      case 'technical': return 'Technical Interview';
      case 'hr': return 'HR Interview';
      case 'gd': return 'Group Discussion';
    }
  };

  if (currentQuestionIndex >= questions.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full bg-gradient-card border-border/50 text-center">
          <CardHeader>
            <CardTitle className="text-3xl text-primary">Interview Completed!</CardTitle>
            <CardDescription className="text-lg">
              Analyzing your responses and preparing your results...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions Answered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{Math.round(currentScore / questions.length)}/10</div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                {getInterviewTypeTitle()}
              </h1>
              <p className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {formatTime(timeElapsed)}
              </div>
              <Badge variant="outline" className="bg-primary/20 text-primary">
                Role: {config.role}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Question Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                      {currentQuestion.difficulty.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="bg-accent/20">
                      {currentQuestion.category}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={speakQuestion}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl leading-relaxed">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Answer Section */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Your Answer
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      size="sm"
                      onClick={toggleRecording}
                      className="flex items-center gap-2"
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      {isRecording ? 'Stop Recording' : 'Voice Input'}
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {isRecording 
                    ? 'Listening... Speak your answer clearly' 
                    : 'Type your answer or use voice input'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Start typing your answer here..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="min-h-32 bg-background/50"
                  disabled={isRecording}
                />
                <div className="flex justify-between items-center mt-4">
                  <Button 
                    variant="ghost"
                    onClick={skipQuestion}
                    disabled={currentQuestionIndex >= questions.length - 1}
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip Question
                  </Button>
                  <Button 
                    variant="hero"
                    onClick={submitAnswer}
                    disabled={!currentAnswer.trim()}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit Answer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Interview Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {Math.round(progress)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Score</span>
                    <span className="font-medium">{Math.round(currentScore / (currentQuestionIndex + 1) * 10) / 10}/10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time Elapsed</span>
                    <span className="font-medium">{formatTime(timeElapsed)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Questions Left</span>
                    <span className="font-medium">{questions.length - currentQuestionIndex - 1}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">💡 Interview Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {config.type === 'technical' ? (
                  <>
                    <p>• Think out loud to show your problem-solving process</p>
                    <p>• Ask clarifying questions when needed</p>
                    <p>• Consider edge cases and scalability</p>
                    <p>• Use concrete examples from your experience</p>
                  </>
                ) : config.type === 'hr' ? (
                  <>
                    <p>• Use the STAR method (Situation, Task, Action, Result)</p>
                    <p>• Be specific with examples</p>
                    <p>• Show enthusiasm and cultural fit</p>
                    <p>• Prepare thoughtful questions</p>
                  </>
                ) : (
                  <>
                    <p>• Listen actively to others' points</p>
                    <p>• Support your arguments with facts</p>
                    <p>• Be respectful of different opinions</p>
                    <p>• Take initiative to guide the discussion</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};