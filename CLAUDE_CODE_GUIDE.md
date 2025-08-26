# 🚀 Claude Code + TechLibs Agent Integration Guide

## 🎯 What You Can Do Now

You now have **Claude Code** integrated with your **TechLibs Agent** project! This gives you powerful AI-assisted coding capabilities directly in your development environment.

## 🛠️ Available Commands

### Start Claude Code in Your Project
```bash
# Start interactive session with project access
npm run claude

# Start with IDE integration (recommended)
npm run claude -- --ide

# Start with specific project directory access
npm run claude -- --add-dir .
```

### Quick Commands
```bash
# Get help
npm run claude -- --help

# Check configuration
npm run claude -- config list

# Set up authentication token
npm run claude -- setup-token

# Check for updates
npm run claude -- update
```

## 🔧 Configuration

### Set Up Authentication
```bash
npm run claude -- setup-token
```
This will guide you through setting up your Anthropic API key for authenticated access.

### Configure Theme
```bash
# Set dark theme
npm run claude -- config set -g theme dark

# Set light theme
npm run claude -- config set -g theme light
```

### Enable IDE Integration
```bash
# Auto-connect to IDE
npm run claude -- config set -g autoConnectIde true

# Auto-install IDE extension
npm run claude -- config set -g autoInstallIdeExtension true
```

## 🎮 Interactive Usage Examples

### 1. **Project Analysis**
```
"Analyze my TechLibs Agent project structure and suggest improvements"
```

### 2. **Workflow Enhancement**
```
"Help me add error handling to the weather workflow"
```

### 3. **Agent Optimization**
```
"Review my product owner agent and suggest better instructions"
```

### 4. **Code Review**
```
"Review the techlibs-agent-workflow.ts file for best practices"
```

### 5. **Feature Addition**
```
"Add a new tool for API rate limiting to my project"
```

## 🔍 Advanced Features

### MCP Integration
Claude Code can work with your Mastra MCP Docs Server:
```bash
npm run claude -- --mcp-config .cursor/mcp.json
```

### Permission Modes
```bash
# Plan mode (recommended for first-time use)
npm run claude -- --permission-mode plan

# Accept edits automatically
npm run claude -- --permission-mode acceptEdits

# Default mode
npm run claude -- --permission-mode default
```

### Tool Access Control
```bash
# Allow specific tools
npm run claude -- --allowed-tools "Bash(git:*) Edit"

# Deny specific tools
npm run claude -- --disallowed-tools "Bash(rm:*)"
```

## 📁 Project-Specific Prompts

### For Your TechLibs Agent:

#### **Workflow Development**
```
"Create a new workflow step that validates user input using Zod schemas"
```

#### **Agent Enhancement**
```
"Improve the weather agent to handle multiple cities and provide comparisons"
```

#### **Tool Integration**
```
"Add a new tool that integrates with a weather API service"
```

#### **Testing**
```
"Write comprehensive tests for the memory tool using Vitest"
```

#### **Documentation**
```
"Generate API documentation for all my workflow endpoints"
```

## 🚨 Best Practices

### 1. **Start with Plan Mode**
Always begin with `--permission-mode plan` to see what Claude wants to do before it makes changes.

### 2. **Use Specific Prompts**
Instead of "help me with this code", try "explain the error handling in the fetchWeather step and suggest improvements".

### 3. **Leverage Project Context**
Claude Code has access to your entire project, so you can ask it to:
- Analyze multiple files together
- Suggest architectural improvements
- Find inconsistencies across the codebase

### 4. **Iterative Development**
Use Claude Code for:
- Initial implementation
- Code review
- Refactoring suggestions
- Testing strategies

## 🔗 Integration with Your Existing Setup

### **Mastra Dev Server** + **Claude Code**
1. Keep your Mastra dev server running: `npm run dev`
2. Use Claude Code in another terminal: `npm run claude`
3. Ask Claude to help with your workflows and agents
4. Test changes immediately in the Mastra playground

### **Cursor IDE** + **MCP Server** + **Claude Code**
1. **Cursor**: Use MCP server for Mastra documentation
2. **Claude Code**: Use for AI-assisted coding and development
3. **Mastra**: Run your AI agents and workflows

## 🎯 Quick Start Workflow

1. **Start your Mastra server:**
   ```bash
   npm run dev
   ```

2. **In another terminal, start Claude Code:**
   ```bash
   npm run claude -- --ide --permission-mode plan
   ```

3. **Ask Claude to help with your project:**
   ```
   "I'm building a TechLibs Agent with Mastra. Help me optimize the product owner agent for better product strategy insights."
   ```

4. **Review Claude's plan and approve changes**

5. **Test your improvements in the Mastra playground**

## 🆘 Troubleshooting

### **Permission Issues**
```bash
# Use plan mode first
npm run claude -- --permission-mode plan

# Then switch to acceptEdits if comfortable
npm run claude -- --permission-mode acceptEdits
```

### **API Key Issues**
```bash
# Set up authentication
npm run claude -- setup-token

# Check configuration
npm run claude -- config list
```

### **IDE Connection Issues**
```bash
# Force IDE connection
npm run claude -- --ide

# Check available IDEs
npm run claude -- --debug ide
```

## 🎉 What's Next?

1. **Set up your Anthropic API key** with `npm run claude -- setup-token`
2. **Start an interactive session** with `npm run claude`
3. **Ask Claude to analyze your project** and suggest improvements
4. **Build new features** with AI assistance
5. **Optimize existing code** based on Claude's suggestions

---

**Happy coding with Claude! 🚀**

Your TechLibs Agent project is now supercharged with:
- ✅ **Mastra Dev Server** (running on localhost:4111)
- ✅ **Claude Code** (AI-assisted development)
- ✅ **MCP Docs Server** (Mastra documentation in Cursor)
- ✅ **Claude API Integration** (for your agents)
