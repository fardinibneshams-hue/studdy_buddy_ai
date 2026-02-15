import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useUploadDocument, useDocument, useSummarizeDocument, useChatHistory, useSendMessage, useGenerateQuiz } from "@/hooks/use-documents";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Upload, FileText, MessageCircle, BrainCircuit, Play, Pause, Send, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Sub-components for better organization

function FileUpload({ onUpload }: { onUpload: (id: number) => void }) {
  const upload = useUploadDocument();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a PDF file!");
      return;
    }
    try {
      const doc = await upload.mutateAsync(file);
      onUpload(doc.id);
    } catch (error) {
      console.error(error);
      alert("Upload failed. Try again.");
    }
  };

  return (
    <div 
      className={cn(
        "border-4 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[400px] bg-white/50 backdrop-blur-sm",
        isDragOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
      }}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <input 
        type="file" 
        id="file-input" 
        className="hidden" 
        accept="application/pdf"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      
      {upload.isPending ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <h3 className="text-2xl font-bold text-slate-700">Reading your file...</h3>
          <p className="text-slate-500">This will just take a moment!</p>
        </div>
      ) : (
        <>
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-primary animate-float">
            <Upload className="w-12 h-12" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-2 font-display">Upload your Homework PDF</h3>
          <p className="text-lg text-slate-500 max-w-md mx-auto">
            Drag and drop your study guide here, or click to browse. Max 10MB.
          </p>
        </>
      )}
    </div>
  );
}

function StudyTab({ docId }: { docId: number }) {
  const { data: doc, isLoading } = useDocument(docId);
  const summarize = useSummarizeDocument();
  const [isPlaying, setIsPlaying] = useState(false);

  // Text to Speech
  const toggleSpeech = () => {
    if (!doc?.summary) return;
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(doc.summary);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary"/></div>;
  if (!doc) return null;

  if (!doc.summary && !summarize.isPending) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BrainCircuit className="w-10 h-10 text-yellow-600" />
        </div>
        <h3 className="text-2xl font-bold mb-4 font-display">Ready to learn?</h3>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">I can read this document and create a simple study guide for you.</p>
        <Button size="lg" onClick={() => summarize.mutate(docId)} className="font-bold text-lg">
          Create Study Guide
        </Button>
      </div>
    );
  }

  if (summarize.isPending) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
        <h3 className="text-xl font-bold text-slate-700">Analyzing content...</h3>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-display text-primary">Summary & Key Points</h2>
        <Button 
          onClick={toggleSpeech}
          className={cn("gap-2 rounded-full", isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700")}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? "Stop Reading" : "Read Aloud"}
        </Button>
      </div>
      
      <Card className="bg-white/50 backdrop-blur-sm border-slate-200">
        <ScrollArea className="h-[500px] p-6 pr-8">
          <div className="prose prose-lg max-w-none text-slate-700">
            {doc.summary?.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}

function ChatTab({ docId }: { docId: number }) {
  const { data: messages = [] } = useChatHistory(docId);
  const sendMessage = useSendMessage();
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage.mutate({ docId, message: input });
    setInput("");
  };

  return (
    <div className="flex flex-col h-[600px] bg-white/50 rounded-2xl border border-slate-200 overflow-hidden">
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 mt-20">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Ask me anything about the document!</p>
            </div>
          )}
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              className={cn(
                "flex w-full",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl p-4 shadow-sm",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                )}
              >
                <p className="leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {sendMessage.isPending && (
             <div className="flex justify-start">
               <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-2">
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
               </div>
             </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 rounded-full border-slate-200 focus-visible:ring-primary"
            disabled={sendMessage.isPending}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full h-10 w-10 shrink-0"
            disabled={sendMessage.isPending || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

function QuizTab({ docId }: { docId: number }) {
  const generateQuiz = useGenerateQuiz();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const startQuiz = async () => {
    try {
      const qs = await generateQuiz.mutateAsync(docId);
      setQuestions(qs);
      setCurrentQIndex(0);
      setAnswers({});
      setShowResults(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnswer = (option: string) => {
    setAnswers(prev => ({ ...prev, [questions[currentQIndex].id]: option }));
  };

  const nextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  if (generateQuiz.isPending) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
        <h3 className="text-xl font-bold text-slate-700">Writing your quiz...</h3>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-pink-600" />
        </div>
        <h3 className="text-2xl font-bold mb-4 font-display">Test your knowledge!</h3>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">I'll generate 5 questions based on your document to help you prepare.</p>
        <Button size="lg" onClick={startQuiz} className="font-bold text-lg bg-pink-500 hover:bg-pink-600 shadow-pink-200">
          Start Quiz
        </Button>
      </div>
    );
  }

  if (showResults) {
    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0), 0);
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-3xl font-bold font-display mb-2">Quiz Complete!</h2>
          <div className="text-6xl font-black text-primary mb-4">{score}/{questions.length}</div>
          <p className="text-slate-500">
            {score === questions.length ? "Perfect score! You're a genius! 🌟" : 
             score > questions.length / 2 ? "Great job! Keep it up! 👍" : 
             "Good effort! Review the study guide and try again. 💪"}
          </p>
          <Button onClick={startQuiz} className="mt-6" variant="outline">Try Again</Button>
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => {
            const isCorrect = answers[q.id] === q.correctAnswer;
            return (
              <Card key={q.id} className={cn("p-6 border-l-8", isCorrect ? "border-l-green-500" : "border-l-red-500")}>
                <div className="flex gap-3 mb-2 font-bold text-lg">
                  <span className="text-slate-400">#{i + 1}</span>
                  <span>{q.question}</span>
                </div>
                <div className="ml-8 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-500">Your Answer:</span>
                    <span className={cn(isCorrect ? "text-green-600" : "text-red-600")}>{answers[q.id]}</span>
                  </div>
                  {!isCorrect && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <span className="font-semibold">Correct Answer:</span>
                      <span>{q.correctAnswer}</span>
                    </div>
                  )}
                  {q.explanation && (
                    <p className="text-sm text-slate-500 mt-2 bg-slate-50 p-3 rounded-lg">
                      💡 <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];
  const selectedAnswer = answers[currentQ.id];

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-6 flex justify-between text-sm font-bold text-slate-400 uppercase tracking-wider">
        <span>Question {currentQIndex + 1} of {questions.length}</span>
        <span>{Math.round(((currentQIndex + 1) / questions.length) * 100)}% Complete</span>
      </div>
      
      <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-slate-100 mb-8 min-h-[200px] flex items-center justify-center text-center">
        <h3 className="text-2xl font-bold text-slate-800">{currentQ.question}</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {currentQ.options?.map((option: string) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            className={cn(
              "p-4 rounded-xl text-left font-semibold text-lg transition-all border-2",
              selectedAnswer === option 
                ? "border-primary bg-primary/10 text-primary shadow-sm" 
                : "border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50 text-slate-700"
            )}
          >
            {option}
          </button>
        ))}
        {!currentQ.options && (
          // True/False or Yes/No fallback if options are null (though schema says options exist for MCQs)
          <div className="flex gap-4">
             <Button 
               onClick={() => handleAnswer("True")} 
               variant={selectedAnswer === "True" ? "default" : "outline"} 
               className="flex-1 h-16 text-xl"
             >True</Button>
             <Button 
               onClick={() => handleAnswer("False")} 
               variant={selectedAnswer === "False" ? "default" : "outline"} 
               className="flex-1 h-16 text-xl"
             >False</Button>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          onClick={nextQuestion} 
          disabled={!selectedAnswer}
          size="lg"
          className="px-8 text-lg"
        >
          {currentQIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
        </Button>
      </div>
    </div>
  );
}

// Main Dashboard Component

export default function Dashboard() {
  const [docId, setDocId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <AnimatePresence mode="wait">
          {!docId ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto mt-10"
            >
              <FileUpload onUpload={setDocId} />
            </motion.div>
          ) : (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-display font-bold text-slate-800">Your Workspace</h1>
                <Button variant="outline" onClick={() => setDocId(null)} className="text-slate-500">
                  Upload Different File
                </Button>
              </div>

              <Tabs defaultValue="study" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-16 p-1 bg-white/50 backdrop-blur-md rounded-2xl mb-8 shadow-sm">
                  <TabsTrigger value="study" className="rounded-xl text-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">
                    <FileText className="w-5 h-5 mr-2" /> Study Guide
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="rounded-xl text-lg font-bold data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-md transition-all">
                    <MessageCircle className="w-5 h-5 mr-2" /> Ask AI
                  </TabsTrigger>
                  <TabsTrigger value="quiz" className="rounded-xl text-lg font-bold data-[state=active]:bg-white data-[state=active]:text-pink-500 data-[state=active]:shadow-md transition-all">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Quiz Me
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="study" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <StudyTab docId={docId} />
                </TabsContent>
                
                <TabsContent value="chat" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ChatTab docId={docId} />
                </TabsContent>
                
                <TabsContent value="quiz" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <QuizTab docId={docId} />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
