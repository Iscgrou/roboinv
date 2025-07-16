// ai-integration-service/aiIntegrationService.js

import axios from 'axios'; // Example for making HTTP requests
// Assuming config module provides AI service endpoints and keys from environment variables
// import config from './config';

class AIAgentService {
  constructor() {
    // Read AI service endpoints and keys from environment variables
    this.sttEndpoint = process.env.STT_API_URL;
    this.nluEndpoint = process.env.NLU_API_URL;
    this.apiKey = process.env.AI_SERVICE_API_KEY; // Example API Key from environment variables
    this.nluModelId = process.env.NLU_MODEL_ID; // Specific model ID for NLU
  }

  /**
   * Converts speech audio data to text using an external STT service.
   * @param {Buffer} audioData - The audio data as a Buffer.
   * @returns {Promise<string>} The transcribed text.
   * @throws {Error} If the STT service request fails.
   */
  async convertSpeechToText(audioData) {
    try {
      const sttEndpoint = process.env.STT_API_URL; // STT API URL from environment variables
      const response = await axios.post(this.sttEndpoint, audioData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`, // Example authorization
          'Content-Type': 'audio/wav', // Example Content-Type
        },
        // Other configuration like responseType: 'json'
      });

      // Extract text from the STT service response
      // The exact path to the transcribed text depends on the STT service API response structure
      const transcribedText = response.data.text; // Assuming the response has a 'text' field
      if (!transcribedText) {
          throw new Error('Unexpected response format from STT service.');
      }

      return transcribedText;
    } catch (error) {
      console.error('Error in convertSpeechToText:', error.message);
      // Implement more specific error handling based on API response
      throw new Error(`Failed to convert speech to text: ${error.message}`);
    }
  }

  /**
   * Analyzes text to identify accounting intent and extract entities.
   * @param {string} text - The text to analyze.
   * @returns {Promise<object>} An object containing the identified intent and entities.
   *                            Example: { intent: 'record_payment', entities: { representative: '...', amount: '...' } }
   * @throws {Error} If the NLU service request fails.
   */
  async analyzeTextForAccountingIntent(text) {
    if (typeof text !== 'string' || text.trim() === '') {
        console.error('Error in analyzeTextForAccountingIntent: Input text is invalid.');
        throw new Error('Input text for NLU analysis is required and must be a non-empty string.');
    }

    try {
      console.log('Calling external NLU service...');

      // Hypothetical request body structure for a real NLU provider
      const requestBody = {
        text: text,
        model_id: this.nluModelId, // Using the configured model ID
        // Include other parameters required by the NLU provider API (e.g., language, features)
        language: 'fa' // Assuming Persian language
      };

      const response = await axios.post(this.nluEndpoint, requestBody, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`, // Authentication
          'Content-Type': 'application/json',
        },
        // Other configuration
      });

      // Assume the NLU service API response is a JSON object like:
      // { "intent": "record_payment", "entities": { "representative": "...", "amount": "..." } }
      const nluResult = response.data; // Assuming the API returns a structured object with intent and entities

      // Basic validation of NLU result structure (depends on expected API response)
      // This validation should be tailored to the specific NLU provider's response format.
      // Example checks assuming a nested intent object and an array of entities:
      if (!nluResult || !nluResult.intent || !Array.isArray(nluResult.entities)) {
          throw new Error('Invalid response structure from NLU service.');
      }

      // Map the NLU provider's response format to our expected format { intent: '...', entities: { ... } }
      const mappedEntities = {};
      if (nluResult.entities) {
          nluResult.entities.forEach(entity => {
              // Assuming each entity object has 'entity' and 'value' fields
              if (entity.entity && entity.value) {
                  mappedEntities[entity.entity] = entity.value;
              }
          });
      }

      const finalResult = {
          intent: nluResult.intent.name, // Assuming intent name is in intent.name
          entities: mappedEntities // Mapped entities
      };

      console.log('Processed NLU result:', finalResult);
      return finalResult;
    } catch (error) {
      console.error('Error in analyzeTextForAccountingIntent:', error.message);
      // Implement more specific error handling based on API response
      throw new Error(`Failed to analyze text for accounting intent: ${error.message}`);
    }
  }

  // Add other AI-related methods here as needed (e.g., for advanced report analysis, reminder personalization)

}

export default AIAgentService;