import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Award,
  FileText,
  ArrowLeft,
  Download
} from "lucide-react";
import { InterviewService } from "@/services/interviewService";
import { useToast } from "@/hooks/use-toast";

interface InterviewReviewProps {
  sessionId: string;
  onBack: () => void;
}

export const InterviewReview: React.FC<InterviewReviewProps> = ({
  sessionId,
  onBack
}) => {
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setIsLoading(true);
      const data = await InterviewService.getSessionWithDetails(sessionId);
      setSessionData(data);
    } catch (error) {
      console.error('Failed to load session data:', error);
      toast({
        title: "Error",
        description: "Failed to load interview data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = () => {
    if (!sessionData) return;

    const report = {
      session: sessionData.session,
      questions: sessionData.questions,
      answers: sessionData.answers,
      review: sessionData.review,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${sessionData.session.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report downloaded",
      description: "Your interview report has been downloaded.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Loading Interview Review</h3>
            <p className="text-muted-foreground">Analyzing your performance...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Interview Not Found</h3>
            <p className="text-muted-foreground mb-4">The interview data could not be loaded.</p>
            <Button onClick={onBack}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { session, questions, answers, review } = sessionData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Interview Review</h1>
              <p className="text-muted-foreground">
                {session.interview_type.toUpperCase()} • {session.target_role}
              </p>
            </div>
          </div>
          <Button onClick={generateReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(session.total_score)}`}>
                    {session.total_score}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold">{formatTime(session.duration_seconds)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-2xl font-bold">{questions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="text-lg font-semibold capitalize">{session.experience_level}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Questions & Answers</TabsTrigger>
            <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {review?.strengths?.length ? (
                    <ul className="space-y-2">
                      {review.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No specific strengths identified.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {review?.weaknesses?.length ? (
                    <ul className="space-y-2">
                      {review.weaknesses.map((weakness: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500 mt-2" />
                          <span className="text-sm">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No specific areas for improvement identified.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Question Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Question Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questions.map((question: any, index: number) => {
                    const answer = answers.find(a => a.question_id === question.id);
                    const score = answer?.ai_score || 0;
                    
                    return (
                      <div key={question.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Q{index + 1}: {question.question_type}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={getScoreColorClass(score)}>
                              {question.difficulty}
                            </Badge>
                            <span className={`font-bold ${getScoreColor(score)}`}>
                              {score}%
                            </span>
                          </div>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            {questions.map((question: any, index: number) => {
              const answer = answers.find(a => a.question_id === question.id);
              const score = answer?.ai_score || 0;
              
              return (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getScoreColorClass(score)}>
                          {question.difficulty}
                        </Badge>
                        <span className={`font-bold ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Question:</h4>
                      <p className="text-muted-foreground">{question.question_text}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Your Answer:</h4>
                      <p className="bg-muted p-3 rounded-lg">{answer?.user_answer || "No answer provided"}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Expected Answer:</h4>
                      <p className="text-muted-foreground text-sm">{question.expected_answer}</p>
                    </div>
                    
                    {answer?.ai_feedback && (
                      <div>
                        <h4 className="font-semibold mb-2">AI Feedback:</h4>
                        <p className="text-sm bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                          {answer.ai_feedback}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            {review ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Comprehensive AI Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {review.ai_analysis}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {review.recommendations?.length ? (
                      <ul className="space-y-3">
                        {review.recommendations.map((recommendation: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No specific recommendations available.</p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">AI feedback is being generated. Please check back later.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};