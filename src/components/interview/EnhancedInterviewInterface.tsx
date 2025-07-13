import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, SkipForward, Clock, Target, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIService } from "@/services/aiService";
import { InterviewService } from "@/services/interviewService";

interface InterviewConfig {
  type: 'technical' | 'hr' | 'gd';
  resume?: File;
  jobDescription: string;
  experience: string;
  role: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswer: string;
}

interface EnhancedInterviewInterfaceProps {
  config: InterviewConfig;
  onComplete: (sessionId: string) => void;
  onBack: () => void;
}

export const EnhancedInterviewInterface: React.FC<EnhancedInterviewInterfaceProps> = ({
  config,
  onComplete,
  onBack
}) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    initializeInterview();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const initializeInterview = async () => {
    try {
      setIsLoading(true);
      
      // Create interview session
      const session = await InterviewService.createSession({
        interviewType: config.type,
        jobDescription: config.jobDescription,
        experienceLevel: config.experience,
        targetRole: config.role,
      });
      
      setSessionId(session.id);

      // Generate questions using AI
      const generatedQuestions = await AIService.generateQuestions(
        config.type,
        config.jobDescription,
        config.experience,
        config.role,
        5
      );

      // Save questions to database
      const savedQuestions = await InterviewService.saveQuestions(session.id, generatedQuestions);
      
      const formattedQuestions = savedQuestions.map(q => ({
        id: q.id,
        text: q.question_text,
        type: q.question_type,
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
        expectedAnswer: q.expected_answer,
      }));

      setQuestions(formattedQuestions);
      setQuestionStartTime(Date.now());
    } catch (error) {
      console.error('Failed to initialize interview:', error);
      toast({
        title: "Error",
        description: "Failed to initialize interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          try {
            const transcription = await AIService.transcribeAudio(audioBlob);
            setCurrentAnswer(transcription);
            toast({
              title: "Transcription complete",
              description: "Your voice has been converted to text.",
            });
          } catch (error) {
            toast({
              title: "Transcription failed",
              description: "Please try again or type your answer.",
              variant: "destructive",
            });
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access or type your answer.",
          variant: "destructive",
        });
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "Empty answer",
        description: "Please provide an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsEvaluating(true);
    const currentQuestion = questions[currentQuestionIndex];
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

    try {
      // Evaluate answer using AI
      const evaluation = await AIService.evaluateAnswer(
        currentQuestion.text,
        currentAnswer,
        currentQuestion.expectedAnswer,
        currentQuestion.type,
        currentQuestion.difficulty
      );

      // Save answer to database
      await InterviewService.saveAnswer({
        questionId: currentQuestion.id,
        sessionId,
        userAnswer: currentAnswer,
        aiScore: evaluation.score,
        aiFeedback: evaluation.feedback,
        answerMethod: isRecording ? 'voice' : 'text',
        timeTaken,
      });

      const newAnswer = {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        userAnswer: currentAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        timeTaken,
      };

      setAnswers(prev => [...prev, newAnswer]);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer('');
        setQuestionStartTime(Date.now());
      } else {
        await completeInterview();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const completeInterview = async () => {
    try {
      const totalScore = Math.round(answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length);
      
      // Complete session in database
      await InterviewService.completeSession(sessionId, totalScore, timeElapsed);

      // Generate comprehensive review
      const review = await AIService.generateReview(
        {
          interviewType: config.type,
          targetRole: config.role,
          experienceLevel: config.experience,
          durationSeconds: timeElapsed,
        },
        answers,
        totalScore
      );

      // Save review to database
      await InterviewService.saveReview(sessionId, review);

      onComplete(sessionId);
    } catch (error) {
      console.error('Failed to complete interview:', error);
      toast({
        title: "Error",
        description: "Failed to complete interview. Please try again.",
        variant: "destructive",
      });
    }
  };

  const skipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const currentQuestion = questions[currentQuestionIndex];
      const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

      // Save skipped answer
      const skippedAnswer = {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        userAnswer: "Question skipped",
        score: 0,
        feedback: "Question was skipped",
        strengths: [],
        improvements: ["Consider attempting all questions"],
        timeTaken,
      };

      setAnswers(prev => [...prev, skippedAnswer]);
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
      setQuestionStartTime(Date.now());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Generating Your Interview</h3>
            <p className="text-muted-foreground">AI is creating personalized questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Failed to Load Interview</h3>
            <p className="text-muted-foreground mb-4">Please try again or contact support.</p>
            <Button onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {config.type.toUpperCase()} Interview
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatTime(timeElapsed)}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Interview Area */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Question Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Question {currentQuestionIndex + 1}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                      {currentQuestion.difficulty}
                    </Badge>
                    <Badge variant="outline">{currentQuestion.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed mb-6">
                  {currentQuestion.text}
                </p>

                {/* Answer Input */}
                <div className="space-y-4">
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here or use voice recording..."
                    className="min-h-[120px] resize-none"
                    disabled={isEvaluating}
                  />

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={isRecording ? "destructive" : "outline"}
                        size="sm"
                        onClick={toggleRecording}
                        disabled={isEvaluating}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        {isRecording ? "Stop Recording" : "Voice Answer"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speechSynthesis.speak(new SpeechSynthesisUtterance(currentQuestion.text))}
                      >
                        <Volume2 className="h-4 w-4" />
                        Read Question
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={skipQuestion}
                        disabled={isEvaluating}
                      >
                        <SkipForward className="h-4 w-4" />
                        Skip
                      </Button>
                      <Button
                        onClick={submitAnswer}
                        disabled={!currentAnswer.trim() || isEvaluating}
                      >
                        {isEvaluating ? "Evaluating..." : "Submit Answer"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Interview Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {questions.map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {index < currentQuestionIndex ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : index === currentQuestionIndex ? (
                        <Target className="h-4 w-4 text-blue-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                      )}
                      <span className={`text-sm ${index === currentQuestionIndex ? 'font-medium' : 'text-muted-foreground'}`}>
                        Question {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Interview Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Be specific and provide examples</p>
                <p>• Structure your answers clearly</p>
                <p>• Take your time to think</p>
                <p>• Stay confident and positive</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};