import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { groqAI, GroqAIResponse } from '@/services/grokAI';
import {
  Sparkles,
  Brain,
  Wand2,
  RefreshCw,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Lightbulb,
  Zap,
  Target,
  Copy
} from 'lucide-react';

interface AISuggestionsProps {
  images: File[];
  onApplySuggestions: (suggestions: Partial<GroqAIResponse & { price: string }>) => void;
  currentFormData?: any;
  isAnalyzing?: boolean;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  images,
  onApplySuggestions,
  currentFormData,
  isAnalyzing = false
}) => {
  const [suggestions, setSuggestions] = useState<GroqAIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);

  const analyzeImages = useCallback(async () => {
    if (images.length === 0) {
      toast.error('Please upload at least one image to get AI suggestions');
      return;
    }

    setLoading(true);
    
    try {
      toast.info('🧠 Analyzing your product images with AI...');
      
      // Use the first image for analysis
      const result = await groqAI.analyzeProductImage({
        imageFile: images[0],
        existingData: currentFormData
      });

      setSuggestions(result);
      
      // Get additional suggestions in parallel
      if (result.confidence > 0.7) {
        try {
          const [nameVariations, keywords] = await Promise.all([
            groqAI.generateProductVariations(result),
            groqAI.generateSEOKeywords(result)
          ]);
          setVariations(nameVariations);
          setSeoKeywords(keywords);
        } catch (error) {
          console.warn('Failed to get additional suggestions:', error);
        }
      }

      toast.success(`✨ AI analysis complete! Confidence: ${(result.confidence * 100).toFixed(0)}%`);
      
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Failed to analyze images. Please try again or check your Groq AI configuration.');
    } finally {
      setLoading(false);
    }
  }, [images, currentFormData]);

  const applySuggestion = (field: string, value: any) => {
    onApplySuggestions({ [field]: value });
    toast.success(`Applied AI suggestion for ${field}`);
  };

  const applyAllSuggestions = () => {
    if (!suggestions) return;
    
    onApplySuggestions({
      name: suggestions.name,
      description: suggestions.description,
      category: suggestions.category,
      color: suggestions.color,
      price: suggestions.priceRange.suggested.toString()
    });
    
    toast.success('🚀 Applied all AI suggestions!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (images.length === 0) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Upload product images to get AI-powered suggestions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Analysis Trigger */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Sparkles className="h-5 w-5" />
            AI Product Intelligence
          </CardTitle>
          <CardDescription className="text-blue-700">
            Get smart suggestions for product name, description, category, and pricing based on your images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {images.length} image{images.length > 1 ? 's' : ''} uploaded
              </Badge>
              {suggestions && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {(suggestions.confidence * 100).toFixed(0)}% confidence
                </Badge>
              )}
            </div>
            
            <Button 
              onClick={analyzeImages}
              disabled={loading || isAnalyzing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions Results */}
      {suggestions && (
        <div className="space-y-4">
          {/* Quick Apply All */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">AI Suggestions Ready</span>
                  <Badge className="bg-green-600 text-white">
                    {(suggestions.confidence * 100).toFixed(0)}% Match
                  </Badge>
                </div>
                <Button
                  onClick={applyAllSuggestions}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Apply All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Individual Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Product Name
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{suggestions.name}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applySuggestion('name', suggestions.name)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Apply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(suggestions.name)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Name Variations */}
                {variations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600">Alternative Names:</p>
                    {variations.map((variation, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                        <span className="text-blue-900">{variation}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => applySuggestion('name', variation)}
                          className="h-6 px-2 text-blue-600"
                        >
                          Use
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-600" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900">{suggestions.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applySuggestion('description', suggestions.description)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Apply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(suggestions.description)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Category & Color */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-purple-600" />
                  Category & Color
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Category:</span>
                    <Badge>{suggestions.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Color:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full border"
                        style={{ backgroundColor: suggestions.color }}
                      />
                      <span className="text-sm font-mono">{suggestions.color}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      applySuggestion('category', suggestions.category);
                      applySuggestion('color', suggestions.color);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Apply Both
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  Smart Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="p-3 bg-orange-50 rounded-lg text-center">
                    <p className="text-lg font-bold text-orange-900">
                      ₹{suggestions.priceRange.suggested.toLocaleString()}
                    </p>
                    <p className="text-xs text-orange-700">Recommended Price</p>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Min: ₹{suggestions.priceRange.min.toLocaleString()}</span>
                    <span>Max: ₹{suggestions.priceRange.max.toLocaleString()}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applySuggestion('price', suggestions.priceRange.suggested.toString())}
                  className="w-full"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Apply Price
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* SEO Keywords */}
          {seoKeywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-indigo-600" />
                  SEO Keywords Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {seoKeywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-indigo-100"
                      onClick={() => copyToClipboard(keyword)}
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click any keyword to copy. Use these for better search visibility.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AISuggestions; 