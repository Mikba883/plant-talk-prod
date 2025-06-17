
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePollyTTS } from '@/hooks/usePollyTTS';

const TtsDebugTool: React.FC = () => {
  const [plantType, setPlantType] = useState("tree");
  const [textToSpeak, setTextToSpeak] = useState("Hello, I am a tree with a long trunk and deep roots.");
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { speak, stop, isPlaying, isLoading } = usePollyTTS();

  const handleTestPolly = async () => {
    try {
      setError(null);
      console.log("[Polly TTS] Testing with plant type:", plantType, "and text:", textToSpeak);
      
      // Use the Polly TTS hook directly
      await speak(textToSpeak, plantType);
      
      toast({
        title: "Testing Polly TTS",
        description: `Plant type: ${plantType} - Audio will autoplay`
      });
      
    } catch (error) {
      console.error("[Polly TTS] Test error:", error);
      toast({
        title: "Polly TTS Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    }
  };

  const handleTestDirectAPI = async () => {
    try {
      setError(null);
      setResponse(null);
      
      console.log("[Polly TTS] Testing direct API call");
      
      const res = await fetch("https://btqokydfhdavjiwgydif.functions.supabase.co/generate-audio", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: textToSpeak,
          voiceId: "Joanna",
          languageCode: "en-US"
        })
      });
      
      console.log("[Polly TTS] Direct API response status:", res.status);
      
      if (!res.ok) {
        throw new Error(`Request failed with status: ${res.status}`);
      }
      
      // Get audio blob directly
      const audioBlob = await res.blob();
      
      if (audioBlob && audioBlob.size > 0) {
        console.log("[Polly TTS] Audio blob received, size:", audioBlob.size, "bytes");
        
        // Create audio URL and play
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
        
        setResponse({ 
          success: true, 
          message: "Audio generated and playing",
          audioSize: audioBlob.size 
        });
        
        toast({
          title: "Direct API test successful",
          description: `Audio generated (${audioBlob.size} bytes) and playing`
        });
      } else {
        throw new Error("No audio data received");
      }
    } catch (error) {
      console.error("[Polly TTS] Direct API error:", error);
      toast({
        title: "Direct API Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto my-4">
      <CardHeader>
        <CardTitle>Polly TTS Debug Tool (Direct Audio)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Plant Type</label>
          <Input
            value={plantType}
            onChange={(e) => setPlantType(e.target.value)}
            placeholder="e.g. tree, cactus, flower, orchid"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Text to Speak</label>
          <Textarea
            value={textToSpeak}
            onChange={(e) => setTextToSpeak(e.target.value)}
            placeholder="Enter text to convert to speech using Polly"
            rows={3}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleTestPolly} 
            disabled={isLoading || isPlaying}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : isPlaying ? (
              "Playing..."
            ) : (
              "Test Polly Hook"
            )}
          </Button>
          
          <Button
            onClick={handleTestDirectAPI}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            Test Direct API
          </Button>
          
          {isPlaying && (
            <Button
              onClick={stop}
              variant="destructive"
              size="sm"
            >
              Stop
            </Button>
          )}
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}
        
        {response && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="font-medium text-sm mb-1">API Response:</p>
            <pre className="text-xs overflow-auto max-h-32 whitespace-pre-wrap">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TtsDebugTool;
