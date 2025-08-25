import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const storePreferences = createStep({
  id: 'store-preferences',
  description: 'Store user preferences in memory',
  inputSchema: z.object({
    action: z.literal('store_preferences'),
    name: z.string(),
    preferredLocation: z.string().optional(),
    temperaturePreference: z.string().optional(),
    activityPreference: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    message: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const { name, preferredLocation, temperaturePreference, activityPreference } = inputData;
    
    // Store user preferences using memory
    if (mastra?.memory) {
      await mastra.memory.set(`user_preferences/${name}/preferred_location`, preferredLocation || '');
      await mastra.memory.set(`user_preferences/${name}/temperature_preference`, temperaturePreference || '');
      await mastra.memory.set(`user_preferences/${name}/activity_preferences`, JSON.stringify(activityPreference || []));
    }

    return {
      message: `Stored preferences for ${name}`,
    };
  },
});

const getWeather = createStep({
  id: 'get-weather',
  description: 'Get personalized weather for user',
  inputSchema: z.object({
    action: z.literal('get_weather'),
    name: z.string(),
  }),
  outputSchema: z.object({
    recommendations: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const { name } = inputData;
    
    // Get user preferences from memory
    let preferredLocation = '';
    if (mastra?.memory) {
      preferredLocation = await mastra.memory.get(`user_preferences/${name}/preferred_location`) || '';
    }

    const agent = mastra?.getAgent('weatherAgent');
    if (!agent) {
      throw new Error('Weather agent not found');
    }

    const prompt = `Get weather for ${preferredLocation || 'user location'} and provide personalized recommendations for ${name}`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let recommendationsText = '';
    for await (const chunk of response.textStream) {
      recommendationsText += chunk;
    }

    return {
      recommendations: recommendationsText,
    };
  },
});

const updateHistory = createStep({
  id: 'update-history',
  description: 'Update user location history',
  inputSchema: z.object({
    action: z.literal('update_history'),
    name: z.string(),
    location: z.string(),
  }),
  outputSchema: z.object({
    message: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const { name, location } = inputData;
    
    // Get existing history and add new location
    if (mastra?.memory) {
      const existingHistory = await mastra.memory.get(`location_history/${name}`) || '[]';
      const history = JSON.parse(existingHistory);
      history.push(location);
      await mastra.memory.set(`location_history/${name}`, JSON.stringify(history));
    }

    return {
      message: `Added ${location} to ${name}'s location history`,
    };
  },
});

const memoryWorkflow = createWorkflow({
  id: 'memory-workflow',
  inputSchema: z.discriminatedUnion('action', [
    z.object({
      action: z.literal('store_preferences'),
      name: z.string(),
      preferredLocation: z.string().optional(),
      temperaturePreference: z.string().optional(),
      activityPreference: z.array(z.string()).optional(),
    }),
    z.object({
      action: z.literal('get_weather'),
      name: z.string(),
    }),
    z.object({
      action: z.literal('update_history'),
      name: z.string(),
      location: z.string(),
    }),
  ]),
  outputSchema: z.union([
    z.object({ message: z.string() }),
    z.object({ recommendations: z.string() }),
  ]),
})
  .when('action', 'store_preferences', storePreferences)
  .when('action', 'get_weather', getWeather)
  .when('action', 'update_history', updateHistory);

memoryWorkflow.commit();

export { memoryWorkflow };