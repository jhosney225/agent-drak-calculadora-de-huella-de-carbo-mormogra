
```javascript
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

// Initialize Anthropic client
const client = new Anthropic();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt user
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

// Store conversation history for multi-turn interactions
const conversationHistory = [];

// Carbon emission factors (kg CO2 per unit)
const emissionFactors = {
  electricity: 0.92, // kg CO2 per kWh
  naturalGas: 2.04, // kg CO2 per cubic meter
  driving: 0.21, // kg CO2 per km (average car)
  flightDomestic: 0.255, // kg CO2 per km
  flightInternational: 0.195, // kg CO2 per km
  beef: 27.0, // kg CO2 per kg
  chicken: 6.9, // kg CO2 per kg
  vegetables: 2.0, // kg CO2 per kg
  publicTransit: 0.089, // kg CO2 per km
};

// Function to calculate carbon footprint based on user inputs
async function calculateCarbonFootprint() {
  console.log("\n=== Personal Carbon Footprint Calculator ===\n");
  console.log("This interactive calculator helps you understand your carbon emissions.");
  console.log("Type 'quit' anytime to exit.\n");

  while (true) {
    // Get user input for activities
    const userInput = await question(
      "Tell me about your daily/monthly activities to calculate carbon emissions (or type 'quit' to exit): "
    );

    if (userInput.toLowerCase() === "quit") {
      console.log("\nThank you for using the Carbon Footprint Calculator!");
      rl.close();
      break;
    }

    // Add user message to conversation history
    conversationHistory.push({
      role: "user",
      content: userInput,
    });

    try {
      // Call Claude API with conversation history
      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: `You are a helpful carbon footprint calculator assistant. 
        
Your role is to:
1. Help users identify their daily/monthly activities that contribute to carbon emissions
2. Extract specific quantities (km driven, kWh used, kg of food consumed, flights taken, etc.)
3. Calculate the carbon emissions based on these activities
4. Provide helpful suggestions to reduce their carbon footprint

When users mention activities, extract the following information:
- Activity type (driving, electricity use, flights, diet, public transit, etc.)
- Quantity (km, kWh, hours, kg, etc.)
- Frequency (daily, weekly, monthly, yearly)

For calculations, use these emission factors:
- Electricity: 0.92 kg CO2/kWh
- Driving (car): 0.21 kg CO2/km
- Domestic flight: 0.255 kg CO2/km
- International flight: 0.195 kg CO2/km
- Beef: 27 kg CO2/kg
- Chicken: 6.9 kg CO2/kg
- Vegetables: 2 kg CO2/kg
- Public transit: 0.089 kg CO2/km
- Natural gas: 2.04 kg CO2/m³

Always:
1. Acknowledge what activities the user mentioned
2. Calculate the carbon emissions if you have enough information
3. Ask clarifying questions if you need more details
4. Provide personalized suggestions to reduce emissions
5. Give context about what their emissions mean (e.g., "equivalent to X trees needed to offset")

Format your response clearly with calculations shown and actionable recommendations.`,
        messages: conversationHistory,
      });

      // Extract assistant's response
      const assistantMessage = response.content[0].text;

      // Add assistant response to conversation history
      conversationHistory.push({
        role: "assistant",
        content: assistantMessage,
      });

      console.log("\n--- Carbon Calculator Response ---");
      console.log(assistantMessage);
      console.log("-----------------------------------\n");
    } catch (error) {
      if (error.status === 529) {
        console.error(
          "\nThe API is currently overloaded. Please wait a moment and try again.\n"
        );
      } else {
        console.error(`\nError: ${error.message}\n`);
      }
    }
  }
}

// Function to demonstrate the calculator with sample data
async function demonstrateCalculator() {
  console.log("\n=== Carbon Footprint Calculator Demo ===\n");

  const demoActivities = [
    "I drive about 30 km daily and use about 20 kWh of electricity per day",
    "I eat meat about 3 times a week - mostly beef. The rest of the time I eat chicken or vegetables",
    "I take one international flight per year to Europe, about 9000 km",
    "How can I reduce my carbon footprint?",
  ];

  for (const activity of demoActivities) {
    console.log(`\nUser: ${activity}`);

    conversationHistory.push({
      role: "user",
      content: activity,
    });

    try {
      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: `You are a helpful carbon footprint calculator assistant. 
        
Your role is to:
1. Help users identify their daily/monthly activities that contribute to carbon emissions
2. Extract specific quantities (km driven, kWh used, kg of food consumed, flights taken, etc.)
3. Calculate the carbon emissions based on these activities
4. Provide helpful suggestions to reduce their carbon footprint

When users mention activities, extract the following information: