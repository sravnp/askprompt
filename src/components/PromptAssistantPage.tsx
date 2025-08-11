import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Sparkles, Bot, User, Copy, CheckCircle2 } from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// About-intent detection and preset response
const normalizeInput = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const isAboutIntent = (input: string) => {
  const q = normalizeInput(input);
  const mentionsBrand = q.includes('quickprompt') || q.includes('askprompt');
  if ((q.includes('tell me') || q.includes('about') || q.includes('who are you') || q.includes('who r u')) && q.includes('yourself')) return true;
  if ((q.includes('this website') || q.includes('this site') || q.includes('this app') || q.includes('this application')) && (q.includes('about') || q.includes('what is'))) return true;
  if (mentionsBrand && (q.includes('what is') || q.includes('about') || q.includes('who developed') || q.includes('who built') || q.includes('who made'))) return true;
  if ((q.includes('who developed') || q.includes('who built') || q.includes('who made')) && (q.includes('this') || mentionsBrand)) return true;
  return false;
};

const ABOUT_RESPONSE = "Developed by: Sravan Penugonda. QuickPrompt is an AI-powered prompt discovery and enhancement tool that helps users find, refine, and save high-quality prompts for any task. Its purpose is to make prompt crafting fast, clear, and effective for Lovable.dev, ChatGPT, Claude, and other AI tools. You can start exploring prompts now!";

const PromptAssistantPage = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "user",
      content: "Help me write an email to my boss",
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: "2",
      type: "ai", 
      content: "Write a professional email to your supervisor requesting approval for a specific project, time off, or discussing work-related concerns. Include: [CONTEXT: Your specific request], [TONE: Professional and respectful], [PURPOSE: Clear statement of what you need], [TIMELINE: When you need a response], and [NEXT STEPS: What happens after approval].",
      timestamp: new Date(Date.now() - 250000)
    },
    {
      id: "3",
      type: "user",
      content: "Make a workout plan",
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: "4", 
      type: "ai",
      content: "Create a comprehensive fitness program tailored to [YOUR FITNESS LEVEL: beginner/intermediate/advanced] with [GOAL: weight loss/muscle gain/endurance/strength]. Include: weekly schedule with specific exercises, sets and reps, progression plan over 8-12 weeks, rest day activities, and nutrition guidelines. Consider any [LIMITATIONS: injuries, time constraints, available equipment] and provide modifications for home/gym workouts.",
      timestamp: new Date(Date.now() - 70000)
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Type something you'd like me to rewrite into a better AI prompt.",
        variant: "destructive"
      });
      return;
    }

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    const inputValue = userInput;
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput("");

    // Preset 'about' intent response
    if (isAboutIntent(inputValue)) {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: ABOUT_RESPONSE,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual Supabase Edge Function call
      // For now, simulate API call with dummy response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Create a detailed and specific prompt for [YOUR TASK: ${inputValue}]. Include: [CONTEXT: relevant background information], [OBJECTIVES: clear goals and expected outcomes], [CONSTRAINTS: any limitations or requirements], [FORMAT: desired output structure], and [EXAMPLES: if applicable]. Be specific about tone, style, and any technical requirements needed for optimal AI response.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      
      toast({
        title: "Prompt rewritten successfully!",
        description: "Your prompt has been optimized for AI systems."
      });

    } catch (error) {
      toast({
        title: "Sorry, something went wrong",
        description: "We couldn't process your request right now. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Copied to clipboard!",
        description: "The prompt has been copied to your clipboard."
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try selecting and copying the text manually.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 animate-pulse bg-primary/20 rounded-full blur-md" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              AskPrompt
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your casual requests into powerful, structured AI prompts. 
            Get better results from ChatGPT, Claude, and other AI systems.
          </p>
        </div>

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col border border-border/50 backdrop-blur-sm">
          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={message.type === 'user' ? 'default' : 'secondary'} className="text-xs">
                        {message.type === 'user' ? 'You' : 'AskPrompt AI'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    
                    <div
                      className={`relative rounded-lg p-4 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground border border-border/20'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      
                      {message.type === 'ai' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-background/10"
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {copiedId === message.id ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1 order-3">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-secondary text-secondary-foreground rounded-lg p-4 border border-border/20">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      </div>
                      <span className="text-sm text-muted-foreground">Rewriting your prompt...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Form */}
          <div className="border-t border-border/20 p-6">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your casual request here... (e.g., 'help me write an email')"
                className="flex-1 bg-background border-border/50"
                disabled={isLoading}
                maxLength={500}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !userInput.trim()}
                className="px-6"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Rewrite
                  </>
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Your prompts will be rewritten to get better results from AI systems
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PromptAssistantPage;