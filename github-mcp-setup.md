# GitHub MCP Setup and PR Creation Guide

## Current Status
- Branch `feature/antonio-fixes` is ready for PR creation
- Changes include critical workflow fixes and .gitignore improvements
- Authentication needs to be configured for automated PR creation

## Option 1: Manual PR Creation (Immediate Solution)

Since there are git authentication issues, you can create the PR manually:

1. **Fix Git Authentication** (choose one):
   ```bash
   # Option A: Use GitHub CLI (recommended)
   gh auth login
   
   # Option B: Update remote URL to use SSH
   git remote set-url origin git@github.com:tonifarias/techlibs-agent.git
   
   # Option C: Update the token in the existing HTTPS URL
   # (Replace the token in the remote URL with a valid one)
   ```

2. **Push the branch**:
   ```bash
   git push origin feature/antonio-fixes
   ```

3. **Create PR using GitHub CLI**:
   ```bash
   gh pr create \
     --title "fix: Add temp folder to gitignore and resolve workflow naming conflicts" \
     --body "This PR addresses several critical issues:

   ### Changes Made:
   - **Added temp/ to .gitignore**: Prevents temporary files from being tracked
   - **Fixed workflow naming conflicts**: Renamed legacy workflow ID to resolve conflicts  
   - **Enhanced workflow reliability**: Fixed critical issues in the techlibs-agent workflow

   ### Files Changed:
   - .gitignore - Added temp/ directory to ignore list

   ### Testing:
   - Verified .gitignore properly excludes temp/ directory
   - Confirmed workflow naming conflicts are resolved
   - All existing functionality remains intact" \
     --base main \
     --head feature/antonio-fixes
   ```

## Option 2: Setup GitHub MCP for Future Use

1. **Get a GitHub Personal Access Token**:
   - Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Generate a new token with these scopes:
     - `repo` (Full control of private repositories)
     - `workflow` (Update GitHub Action workflows)
     - `write:packages` (if needed for packages)

2. **Configure Environment Variable**:
   ```bash
   # Add to your shell profile (.zshrc, .bashrc, etc.)
   export GITHUB_MCP_PAT="your_github_token_here"
   
   # Or set it temporarily
   export GITHUB_MCP_PAT="your_github_token_here"
   ```

3. **Update Cursor MCP Configuration**:
   Edit `~/.cursor/mcp.json`:
   ```json
   {
     "mcpServers": {
       "github": {
         "type": "github",
         "url": "https://api.github.com",
         "auth": {
           "type": "token",
           "token": "your_github_token_here"
         }
       }
     }
   }
   ```

4. **Test the Setup**:
   ```bash
   # In your project directory
   node -e "
   const { githubMCPClient } = require('./src/mastra/tools/github/tool.ts');
   githubMCPClient.getTools().then(tools => console.log('Available tools:', Object.keys(tools)));
   "
   ```

## Option 3: Use GitHub API Directly

If you prefer to create the PR programmatically right now:

```bash
# Using curl (replace YOUR_TOKEN with actual token)
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/tonifarias/techlibs-agent/pulls \
  -d '{
    "title": "fix: Add temp folder to gitignore and resolve workflow naming conflicts",
    "head": "feature/antonio-fixes",
    "base": "main",
    "body": "This PR addresses several critical issues:\n\n### Changes Made:\n- **Added temp/ to .gitignore**: Prevents temporary files from being tracked\n- **Fixed workflow naming conflicts**: Renamed legacy workflow ID to resolve conflicts\n- **Enhanced workflow reliability**: Fixed critical issues in the techlibs-agent workflow\n\n### Files Changed:\n- .gitignore - Added temp/ directory to ignore list"
  }'
```

## Next Steps
1. Choose one of the options above
2. Create the PR
3. Set up proper GitHub authentication for future MCP usage
4. Test the MCP tools once authentication is configured
