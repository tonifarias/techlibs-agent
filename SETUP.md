# TechLibs Agent Setup Guide

## 🚀 Quick Start

This guide will help you set up your TechLibs Agent with Claude API integration and Mastra MCP Docs Server.

## 📋 Prerequisites

- Node.js 20.9.0 or higher
- npm or pnpm package manager
- Cursor IDE (for MCP integration)
- Anthropic API key for Claude

## 🔑 Environment Setup

1. **Copy the environment template:**
   ```bash
   cp config.env.example .env
   ```

2. **Edit `.env` file and add your API keys:**
   ```bash
   # Required: Anthropic Claude API Key
   ANTHROPIC_API_KEY=your_actual_anthropic_api_key_here
   
   # Optional: OpenAI API Key (fallback)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Mastra Configuration
   MASTRA_LOG_LEVEL=info
   MASTRA_STORAGE_URL=file:./mastra.db
   CLAUDE_MODEL=claude-3-5-sonnet-20241022
   ```

3. **Get your Anthropic API key:**
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Create an account or sign in
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key to your `.env` file

## 🎯 MCP Docs Server Setup (Cursor IDE)

The MCP Docs Server is already configured in `.cursor/mcp.json`. This gives you access to Mastra's complete knowledge base directly in Cursor.

### Enable MCP Server in Cursor:

1. **Open Cursor settings** (Cmd/Ctrl + ,)
2. **Navigate to MCP settings**
3. **Click "enable" on the Mastra MCP server**
4. **Restart your agent chat** to use the MCP server

### What you can now do:

- **Ask about Mastra features:** "How do I add evals to my agent?"
- **Get code examples:** "Show me how to create a workflow with conditional branching"
- **Debug issues:** "I'm having trouble with agent memory, what's the latest on this?"
- **Learn integrations:** "How does Mastra work with the AI SDK?"

## 🏗️ Project Structure

```
src/mastra/
├── agents/
│   ├── productOwner.ts      # Product strategy agent (Claude)
│   └── weather-agent.ts     # Weather assistant (Claude)
├── config/
│   └── models.ts            # Model configuration utilities
├── workflows/
│   ├── techlibs-agent-workflow.ts  # Main product workflow
│   ├── weather-workflow.ts         # Weather workflow
│   └── memory-workflow.ts          # Memory management
└── tools/
    ├── memory-tool.ts       # Memory operations
    └── weather-tool.ts      # Weather API integration
```

## 🚀 Running the Project

### Development Mode
```bash
npm run dev
```
- Starts development server on http://localhost:4111
- Playground available at http://localhost:4111
- API endpoints at http://localhost:4111/api

### Build for Production
```bash
npm run build
npm start
```

### Testing
```bash
npm test
```

## 🔧 Configuration Options

### Available Claude Models:
- `claude-3-5-sonnet-20241022` (default - balanced)
- `claude-3-5-haiku-20241022` (fastest)
- `claude-3-opus-20240229` (most capable)

### Available OpenAI Models:
- `gpt-4o` (most capable)
- `gpt-4o-mini` (fastest)
- `gpt-4-turbo` (balanced)

### Changing Models:
Edit `src/mastra/config/models.ts` or set `CLAUDE_MODEL` in your `.env` file.

## 🧪 Testing Your Setup

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test the weather workflow:**
   ```bash
   curl -X POST http://localhost:4111/api/workflows/weather-workflow/execute \
     -H "Content-Type: application/json" \
     -d '{"city": "San Francisco"}'
   ```

3. **Test the main workflow:**
   ```bash
   curl -X POST http://localhost:4111/api/workflows/techlibs-agent-workflow/execute \
     -H "Content-Type: application/json" \
     -d '{"problemStatement": "Create a task management app"}'
   ```

## 🐛 Troubleshooting

### Common Issues:

1. **"ANTHROPIC_API_KEY environment variable is required"**
   - Make sure you've created a `.env` file
   - Verify your API key is correct
   - Restart your terminal/IDE after adding the `.env` file

2. **MCP Server not working in Cursor**
   - Check that `.cursor/mcp.json` exists
   - Restart Cursor completely
   - Verify the MCP server is enabled in settings

3. **Build failures**
   - Ensure all dependencies are installed: `npm install`
   - Check Node.js version: `node --version`
   - Clear npm cache: `npm cache clean --force`

### Getting Help:

- **Mastra Documentation:** Available through MCP server in Cursor
- **Community:** Join [Mastra Discord](https://discord.gg/mastra)
- **Issues:** Check [Mastra GitHub](https://github.com/mastra-ai/mastra)

## 🔄 Next Steps

1. **Customize your agents** - Modify instructions and descriptions in `src/mastra/agents/`
2. **Add new workflows** - Create new workflows in `src/mastra/workflows/`
3. **Integrate with your tools** - Add new tools in `src/mastra/tools/`
4. **Deploy to production** - Use `npm run build` and deploy the output

## 📚 Additional Resources

- [Mastra Documentation](https://mastra.ai/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Cursor IDE](https://cursor.sh/)

---

Happy building! 🎉
