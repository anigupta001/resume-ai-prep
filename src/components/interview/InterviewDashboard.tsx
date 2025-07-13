import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Clock, 
  FileText, 
  Award,
  Plus,
  Eye,
  Calendar
} from "lucide-react";
import { InterviewService, InterviewSession } from "@/services/interviewService";
import { useToast } from "@/hooks/use-toast";

interface InterviewDashboardProps {
  onStartNew: () => void;
  onViewReview: (sessionId: string) => void;
}

export const InterviewDashboard: React.FC<InterviewDashboardProps> = ({
  onStartNew,
  onViewReview
}) => {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const userSessions = await InterviewService.getUserSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load interview history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'reviewed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'reviewed');
  const avgScore = completedSessions.length > 0 
    ? Math.round(completedSessions.reduce((sum, s) => sum + s.total_score, 0) / completedSessions.length)
    : 0;

  const totalMinutes = completedSessions.reduce((sum, s) => sum + Math.floor(s.duration_seconds / 60), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Loading Dashboard</h3>
            <p className="text-muted-foreground">Fetching your interview history...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Interview Dashboard</h1>
            <p className="text-muted-foreground">Track your interview performance and progress</p>
          </div>
          <Button onClick={onStartNew} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            New Interview
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Interviews</p>
                  <p className="text-2xl font-bold">{sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
                    {avgScore}%
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
                  <p className="text-sm text-muted-foreground">Practice Time</p>
                  <p className="text-2xl font-bold">{totalMinutes}m</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedSessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Interviews */}
        <Card>
          <CardHeader>
            <CardTitle>Interview History</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No interviews yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your first mock interview to begin practicing
                </p>
                <Button onClick={onStartNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Your First Interview
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{session.target_role}</h4>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {session.interview_type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(session.created_at)}
                          </span>
                          {session.duration_seconds > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(session.duration_seconds)}
                            </span>
                          )}
                          <span className="capitalize">
                            {session.experience_level} level
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {(session.status === 'completed' || session.status === 'reviewed') && (
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getScoreColor(session.total_score)}`}>
                            {session.total_score}%
                          </p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </div>
                      )}
                      
                      {(session.status === 'completed' || session.status === 'reviewed') && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onViewReview(session.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Review
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};