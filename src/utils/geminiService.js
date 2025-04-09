import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Generative AI API with your API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Function to generate a travel itinerary using Gemini AI
export const generateItinerary = async (tripData) => {
  try {
    // Access the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Structure the prompt with the user's travel preferences
    const prompt = `
      Create a detailed travel itinerary for the following trip:
      
      Destination: ${tripData.destination}
      Start Date: ${tripData.startDate}
      End Date: ${tripData.endDate}
      Budget: $${tripData.budget}
      Number of travelers: ${tripData.travelers}
      Interests: ${tripData.interests.join(', ')}
      Accommodation preference: ${tripData.accommodationType || 'Any'}
      Transportation preference: ${tripData.transportationType || 'Any'}
      
      Please include:
      1. Day-by-day schedule with morning, afternoon, and evening activities
      2. Recommended attractions that match the interests
      3. Dining recommendations within the budget
      4. Estimated costs for activities and meals
      5. Transportation options between locations
      6. Accommodation suggestions
      7. Tips specific to the destination
      
      Format the response as a structured JSON object with the following structure:
      {
        "days": [
          {
            "date": "YYYY-MM-DD",
            "dayNumber": 1,
            "morning": { "activity": "", "description": "", "estimatedCost": 0 },
            "afternoon": { "activity": "", "description": "", "estimatedCost": 0 },
            "evening": { "activity": "", "description": "", "estimatedCost": 0 },
            "accommodation": { "name": "", "description": "", "estimatedCost": 0 }
          }
        ],
        "totalEstimatedCost": 0,
        "generalTips": [""],
        "accommodationSuggestions": [""],
        "transportationOptions": [""]
      }
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      // Find JSON in the response using regex (in case there's additional text)
      const jsonMatch = text.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      throw new Error("Failed to parse the AI-generated itinerary. Please try again.");
    }
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw new Error("Failed to generate itinerary. Please try again later.");
  }
}; 