# Fixing Vercel Python Detection Issue

If Vercel is detecting your project as Python/FastAPI instead of Node.js, follow these steps:

## Solution 1: Manual Configuration in Vercel Dashboard

1. **Delete the current project** in Vercel (if it exists):
   - Go to your project settings
   - Click "Settings" → "Delete Project"

2. **Re-import the project**:
   - Click "Add New..." → "Project"
   - Import `xFactorSOL/polymarket-agent`

3. **In the Configure Project step, manually set**:
   - **Framework Preset**: Select **"Other"** (NOT auto-detect)
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave **EMPTY** (Vercel compiles TypeScript automatically for API routes)
   - **Output Directory**: Leave **EMPTY**
   - **Install Command**: `npm install`

4. **Deploy**

## Solution 2: Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (it will ask questions, make sure to select Node.js)
cd polymarket-agent
vercel

# When prompted:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? polymarket-agent (or your preferred name)
# - Directory? ./
# - Override settings? No (or Yes if you want to configure)
```

## Solution 3: Check Repository Root

Make sure there are NO Python files in the repository root that might confuse Vercel:

```bash
# Check for Python files
find . -maxdepth 1 -name "*.py" -o -name "pyproject.toml" -o -name "requirements.txt"
```

If any exist, either delete them or add them to `.gitignore`.

## Why This Happens

Vercel's auto-detection looks for framework indicators. If it finds anything that looks like Python (or if the detection fails), it might default to Python. By explicitly selecting "Other" and ensuring `package.json` is present, Vercel will recognize it as a Node.js project.
