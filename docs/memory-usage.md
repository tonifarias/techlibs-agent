# Memory Functionality with Mastra MCP

This project now includes comprehensive memory functionality using Mastra MCP (Model Context Protocol) for persistent storage and retrieval of user preferences, conversation history, and contextual information.

## Features

### 🔧 Memory Tool
The `memoryTool` provides four main operations:
- **Store**: Save information with a key and optional namespace
- **Retrieve**: Get stored information by key
- **Delete**: Remove stored information by key
- **List**: Get all stored memories, optionally filtered by namespace

### 🧠 MCP Memory Integration
- Uses `@modelcontextprotocol/server-memory` for persistent storage
- Integrated with LibSQL for reliable data persistence
- Shared memory across all agents and workflows

### 🤖 Enhanced Weather Agent
The weather agent now:
- Remembers user preferences and frequently requested locations
- Provides personalized weather recommendations
- Stores conversation context for better user experience
- Uses memory to suggest activities based on past interactions

## Usage Examples

### 1. Store User Preferences
```typescript
// Store user preferences
await mastra.runWorkflow('memoryWorkflow', {
  action: 'store_preferences',
  name: 'John',
  preferredLocation: 'San Francisco',
  temperaturePreference: 'moderate',
  activityPreference: ['hiking', 'cycling', 'coffee shops'],
});
```

### 2. Get Personalized Weather
```typescript
// Get weather for user's preferred location
await mastra.runWorkflow('memoryWorkflow', {
  action: 'get_weather',
  name: 'John',
});
```

### 3. Update Location History
```typescript
// Add location to user's history
await mastra.runWorkflow('memoryWorkflow', {
  action: 'update_history',
  name: 'John',
  location: 'Golden Gate Park',
});
```

### 4. Direct Agent Memory Operations
```typescript
const agent = mastra.getAgent('weatherAgent');
const response = await agent.stream([
  {
    role: 'user',
    content: 'Remember that I prefer outdoor activities when it\'s sunny',
  },
]);
```

## Memory Storage Structure

The memory system uses a hierarchical structure:

```
user_preferences/
├── john/
│   ├── preferred_location: "San Francisco"
│   ├── temperature_preference: "moderate"
│   └── activity_preferences: ["hiking", "cycling", "coffee shops"]
├── location_history/
│   └── john: ["Golden Gate Park", "Fisherman's Wharf", ...]
└── conversation_context/
    └── session_123: "Previous weather discussion about hiking..."
```

## Configuration

### MCP Configuration
The MCP client is configured in `src/mastra/mcp.ts`:
```typescript
export const mcp = new MCPClient({
  servers: {
    memory: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-memory"],
    },
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
```

### Agent Configuration
Agents use MCP memory instead of local memory:
```typescript
export const weatherAgent = new Agent({
  // ... other config
  memory: mcp.memory, // Use MCP memory
  tools: { weatherTool, memoryTool },
});
```

## Running the Examples

1. **Build the project**:
   ```bash
   pnpm build
   ```

2. **Run the memory example**:
   ```bash
   node examples/memory-example.js
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   ```

## Memory Best Practices

1. **Use Namespaces**: Organize memory by user, session, or context
2. **Store Structured Data**: Use JSON strings for complex data
3. **Clean Up**: Delete old memories to prevent storage bloat
4. **Error Handling**: Always handle memory operation failures gracefully
5. **Privacy**: Be mindful of what data you store and for how long

## Troubleshooting

### Common Issues

1. **Memory Not Persisting**: Check that the database file path is correct
2. **Agent Not Using Memory**: Ensure the agent is configured with `mcp.memory`
3. **Memory Tool Errors**: Verify the MCP memory server is properly installed

### Debug Commands

```typescript
// List all memories
await agent.stream([
  {
    role: 'user',
    content: 'List all stored memories using the memoryTool',
  },
]);

// Check memory status
console.log('Memory available:', !!mcp.memory);
```

## Future Enhancements

- [ ] Memory expiration and cleanup
- [ ] Memory search and filtering
- [ ] Memory analytics and insights
- [ ] Multi-user memory isolation
- [ ] Memory backup and restore


