# AI Expert Workflow MCP

[![npm version](https://badge.fury.io/js/ai-expert-workflow-mcp.svg)](https://badge.fury.io/js/ai-expert-workflow-mcp)

An MCP (Model Context Protocol) server that implements the AI Expert Workflow using OpenRouter API for AI capabilities. This project allows you to consult with AI experts in product management, UX design, and software architecture to plan and develop your projects. It can be used standalone or with Task Master for task management (optional).

## How AI Expert Workflow Interacts With You

The AI Expert Workflow is designed to provide a natural, conversational experience that guides you through the product development process:

### Conversation Flow

The system engages in conversation with you until you're ready to generate a document:

1. **You Control Document Generation**
   - The AI will chat with you until you explicitly request document generation with phrases like "generate document" or "create PRD"
   - If you request a document before all important topics are covered, the AI will let you know what's missing and continue the conversation
   - Only when all necessary topics are covered will the AI generate the document

2. **Comprehensive Topic Coverage**
   - The AI guides you through all important aspects of your product
   - Each expert focuses on specific topics (product vision, user personas, technical architecture, etc.)
   - The AI doesn't move to the next topic until the current one is thoroughly explored

3. **Verification Before Completion**
   - Before concluding each stage, the AI verifies that all your requirements are accurately captured
   - The AI asks for your confirmation before generating any document
   - You have full control over when to move forward

### Document Storage

When you're ready to generate documents:

- Each expert's document is saved in the main directory (e.g., `PRD.md`, `UX_Design_Document.md`)
- The `scripts/prd.txt` file is continuously updated throughout all phases:
  - First, it contains the Product Manager's document
  - Then, the UX Designer's content is added with appropriate section headers
  - Finally, the Software Architect's content is added to complete the specification
- This ensures that by the end of the workflow, `scripts/prd.txt` contains a comprehensive specification with input from all three experts
- Individual expert contributions are also saved separately as reference files

**Important**: The `scripts/prd.txt` file is continuously improved throughout the workflow, making it ready for Task Master at any point, but it's most valuable after all three expert phases are complete.

## 🚀 Quick Start for End Users

### Standalone Usage (Recommended)

1. Install AI Expert Workflow globally:
   ```bash
   npm install -g ai-expert-workflow-mcp
   ```

2. Get an OpenRouter API key:
   - **OpenRouter API key** for AI Expert Workflow: [Get one here](https://openrouter.ai/keys)

3. Generate a PRD for your project:
   ```bash
   # Set your API key
   export OPENROUTER_API_KEY=your_key_here

   # Generate a PRD
   npx ai-expert-workflow-generate "Your detailed project description"
   ```

4. Review your PRD in `prd.md`

### Optional: Task Master Integration

If you also want to use Task Master for task management (optional):

1. Install Task Master globally:
   ```bash
   npm install -g task-master-ai
   ```

2. Get the additional API keys:
   - **Anthropic API key** for Task Master AI: [Get one here](https://console.anthropic.com/)
   - **Perplexity API key** (optional) for Task Master AI enhanced research capability: [Get one here](https://docs.perplexity.ai/docs/getting-started)

3. Configure your Cursor settings with both MCPs:
   ```json
   {
     "mcpServers": {
       "ai-expert-workflow": {
         "command": "npx",
         "args": ["-y", "ai-expert-workflow-mcp"],
         "env": {
           "OPENROUTER_API_KEY": "YOUR_OPENROUTER_API_KEY_HERE",
           "OPENROUTER_MODEL": "tngtech/deepseek-r1t-chimera:free",
           "MAX_TOKENS": 8000,
           "TEMPERATURE": 0.7
         }
       },
       "taskmaster-ai": {
         "command": "npx",
         "args": ["-y", "task-master-ai"],
         "env": {
           "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY_HERE",
           "PERPLEXITY_API_KEY": "YOUR_PERPLEXITY_API_KEY_HERE",
           "MODEL": "claude-3-sonnet-20240229",
           "PERPLEXITY_MODEL": "sonar-pro",
           "MAX_TOKENS": 64000,
           "TEMPERATURE": 0.2,
           "DEFAULT_SUBTASKS": 5,
           "DEFAULT_PRIORITY": "medium"
         }
       }
     }
   }
   ```

   Note on models: With OpenRouter, you can choose from many AI models beyond Claude:
   - For creative tasks: `openai/gpt-4o`, `anthropic/claude-3-opus-20240229`
   - For balanced performance: `anthropic/claude-3-sonnet-20240229`, `mistral/mistral-large`
   - For faster, cost-effective options: `openai/gpt-3.5-turbo`, `anthropic/claude-3-haiku-20240307`
   - Other options: `google/gemini-pro`, `meta/llama-3-70b`, `cohere/command-r`

   See the [complete list of OpenRouter models](https://openrouter.ai/models) for all available options.

3. Enable the MCPs in your Cursor settings.

### Complete Workflow Examples

#### Option 1: Standalone PRD Generation (Recommended)
```bash
# Install AI Expert Workflow globally
npm install -g ai-expert-workflow-mcp

# Set your OpenRouter API key
export OPENROUTER_API_KEY=your_openrouter_key_here

# Generate a PRD with one command
npx ai-expert-workflow-generate "I want to build a recipe app that helps users find recipes based on ingredients they already have at home. Target users are home cooks who want to reduce food waste and save money."
```

This single command will:
1. Generate a comprehensive PRD document based on your description
2. Save it as `prd.md` in your current directory
3. Also save it in Task Master compatible format (at `scripts/prd.txt`) in case you want to use Task Master later

#### Option 2: Interactive Conversation Workflow

#### Step 1: Plan your Product with the AI Product Manager
```
User: Can you start the AI Expert Workflow for my new mobile recipe app?

AI: I'll start the AI Expert Workflow to help you plan your mobile recipe app. What specific aspect would you like to begin with?

User: Let's create a PRD with the AI Product Manager. I want to build a recipe app that helps users find recipes based on ingredients they already have at home.

AI: [Asks clarifying questions about target users, key features, monetization, etc.]

User: [Provides detailed responses about the app vision]
```

#### Step 2: Generate the PRD
```
User: Can you generate a complete PRD document based on our consultation?

AI: [Generates comprehensive PRD with MVP focus and lean startup validation plan]

AI: Document saved to PRD.md. You can now review it and use it for your development planning.
```

#### Step 3 (Optional): Use Task Master to Create Tasks
If you want to break down your PRD into development tasks, you can optionally use Task Master:

```
User: Can you parse the PRD at scripts/prd.txt and generate tasks?

AI: [Task Master parses the PRD and creates a structured list of tasks with priorities]

User: What's the next task I should work on?

AI: [Task Master suggests the highest priority task with implementation details]
```

This streamlined workflow transforms your idea into a well-planned product with a comprehensive PRD. You can then optionally use Task Master to break it down into development tasks.

## Features

- **Enhanced Workflow Structure**: Structured conversation flow with topic tracking and stage transitions
- **Standalone PRD Generation**: Generate comprehensive PRDs without any dependencies
- **Consult with AI experts** in three key roles:
  - AI Product Manager
  - AI UX Designer
  - AI Software Architect
- **Topic-Based Conversations**: Ensures comprehensive coverage of all important aspects
- **Progress Tracking**: Automatically tracks completed topics and guides you through the process
- **Generate comprehensive documents**:
  - Product Requirements Document (PRD) with MVP focus and lean startup approach
  - UX Design Document with prototype descriptions and user testing plans
  - Software Architecture Specification with functional specifications and technical design
  - Comprehensive Project Specification combining all three documents
- **Optional Task Master integration**: Can be used with Task Master if you want task management
- **Powered by OpenRouter API** for maximum flexibility across AI models:
  - Works with OpenAI models (GPT-4o, GPT-4-turbo, GPT-3.5-turbo)
  - Works with Anthropic models (Claude 3 Opus, Sonnet, Haiku)
  - Works with other models (Google Gemini, Mistral, Llama, Cohere, etc.)

## Benefits of Using AI Expert Workflow MCP

- **Structured Approach**: Guided workflow ensures comprehensive coverage of all important aspects
- **Complete Project Planning**: Expert guidance through the entire product development process
- **Topic Tracking**: Automatic tracking of completed topics prevents gaps in your planning
- **Seamless Transitions**: Smooth transitions between experts with context preservation
- **Standalone Operation**: Works completely on its own without requiring Task Master
- **Lean Startup Approach**: Focus on MVP definition and validation plans
- **User-Centered Design**: Create user experiences based on solid UX principles
- **Technical Excellence**: Design scalable architectures that meet your requirements
- **Comprehensive Documentation**: Generate complete project specifications that combine all phases
- **Optional Task Master Integration**: Convert your PRD into development tasks if needed
- **Cursor Integration**: Seamless workflow within your development environment
- **Model Flexibility**: Choose from dozens of AI models through OpenRouter API
  - Use high-performance models (Claude Opus, GPT-4o) for complex planning
  - Use balanced models (Claude Sonnet, Mistral) for everyday work
  - Use fast models (Claude Haiku, GPT-3.5) for quick iterations

## Installation

### Global Installation (Recommended)

The easiest way to use AI Expert Workflow MCP is to install it directly from npm:

```bash
npm install -g ai-expert-workflow-mcp
```

This makes the `ai-expert-workflow-mcp` command globally available in your terminal.

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/bacoco/ai-expert-workflow-mcp.git
   cd ai-expert-workflow-mcp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your OpenRouter API key to the `.env` file (get one from https://openrouter.ai/keys)

4. Build the project:
   ```
   npm run build
   ```

5. Start the server:
   ```
   npm start
   ```

6. Run tests (optional):
   ```
   # Run essential tests (recommended for quick verification)
   npm run test:essential

   # Run individual tests
   npm run test:mcp-only        # Test only the MCP server
   npm run test:openrouter-direct  # Test only the OpenRouter API

   # Run JavaScript tests
   npm test

   # Run TypeScript tests
   npm run test:ts

   # Or use the shell scripts
   ./tests/run-js-test.sh
   ./tests/run-ts-test.sh

   # Run comprehensive tests (builds and runs both JS and TS tests)
   ./tests/run-comprehensive-test.sh
   ```

   Test results will be saved to `tests/results/result_test.md` and `tests/results/result_test_ts.md`.


   > **IMPORTANT**: The tests will fail with the default API key. To verify your OpenRouter API key without modifying the `.env` file, use one of these scripts:
   >
   > Verify and update in one step:
   > ```
   > npm run verify-and-update YOUR_API_KEY
   > ```
   >
   > Or run the steps separately:
   > ```
   > # Verify your API key
   > npm run verify-openrouter YOUR_API_KEY
   >
   > # Update the MCP configuration
   > npm run update-config YOUR_API_KEY
   > ```
## Usage with Cursor AI

1. Add the MCP configuration to your editor:

```json
{
  "mcpServers": {
    "ai-expert-workflow": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "${workspaceFolder}",
      "env": {
        "OPENROUTER_API_KEY": "${env:OPENROUTER_API_KEY}",
        "OPENROUTER_MODEL": "tngtech/deepseek-r1t-chimera:free",
        "MAX_TOKENS": 4000,
        "TEMPERATURE": 0.7,
        "MCP_TIMEOUT": "120000",
        "DEBUG": "mcp"
      }
    },
    "taskmaster-ai": {
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "OPENROUTER_API_KEY": "${env:OPENROUTER_API_KEY}",
        "OPENROUTER_MODEL": "openai/gpt-4-turbo",
        "MAX_TOKENS": 8000,
        "TEMPERATURE": 0.7,
        "DEFAULT_SUBTASKS": 5,
        "DEFAULT_PRIORITY": "medium"
      }
    }
  }
}
```

2. Enable the MCP in your editor settings

3. Use natural language to interact with the AI Expert Workflow:

**Start the complete workflow:**
```
Can you start the AI Expert Workflow for my project?
```

**Work with specific experts:**
```
Can you consult with the AI Product Manager to create a PRD for my project?
```

**Move between stages:**
```
Let's move to the next stage
```

**Generate documents:**
```
Can you generate a complete PRD document based on our consultation?
```

**Check progress:**
```
What topics have we covered so far?
What topics do we still need to discuss?
```

4. After generating your PRD, optionally use Task Master to create tasks:

```
Can you parse the PRD at scripts/prd.txt and generate tasks?
```

## Enhanced AI Expert Workflow

The workflow has been enhanced with a structured conversation flow that guides users through a comprehensive product development process. It follows the "Méthode des Trois Sphères" (Three Spheres Method), a methodical approach that transforms ideas into functional products through three distinct phases:

### The Three Spheres Method

The AI Expert Workflow implements the Three Spheres Method, where each expert builds upon the work of the previous one:

1. **Sphere 1: Product Definition & Architectural Foundation** (AI Product Manager)
   - Establishes the solid foundation for the entire project
   - Defines the product vision, user personas, business requirements, and key features
   - Creates the initial PRD document

2. **Sphere 2: UX Design & Feature Expansion** (AI UX Designer)
   - Uses the Product Manager's document as input
   - Develops the user experience and expands on each feature
   - Adds UI documentation, user journeys, and interaction patterns to the PRD

3. **Sphere 3: Technical Planning & Implementation Specifications** (AI Software Architect)
   - Uses both the Product Manager's and UX Designer's documents as input
   - Transforms the vision into a concrete technical plan
   - Adds technical architecture, API specifications, and implementation tasks to the PRD

Each expert has access to the documents generated by previous experts, ensuring a progressive development process where each phase builds upon the previous one.

### Conversation Flow and Document Generation

The system is designed to engage in conversation with the user until either:

1. **User Explicitly Requests Document Generation**
   - The `shouldGenerateDocument` function (lines 101-118) checks for phrases like "generate document", "create PRD", etc.
   - If the user requests document generation, the system checks if all required topics have been covered (line 43)
   - If topics are missing, it informs the user and continues the conversation (lines 46-49)
   - Only when all topics are covered will it generate the document

2. **AI Determines Enough Information Has Been Gathered**
   - Each expert prompt explicitly instructs to "Don't move to the next topic until the current one is sufficiently defined" (line 15)
   - The system tracks topic completion (lines 247-281)
   - The expert prompts include instructions to "verify with the user if all requirements are accurately captured" before concluding (line 32)
   - The prompts also instruct to ask the user "if they would like to generate the final PRD document" (line 32)

3. **Verification Before Moving On**
   - All three expert prompts include instructions to verify with the user before concluding
   - The Product Manager prompt: "Before concluding, verify with the user if all requirements are accurately captured. When the user is satisfied, ask if they would like to generate the final PRD document..." (line 32)
   - The UX Designer prompt: "Before concluding, verify all UX decisions with the user and ensure alignment with the product vision. When the user is satisfied, ask if they would like to generate the final UX Design Document..." (line 30)
   - The Software Architect prompt: "Before concluding, verify the technical approach with the user and ensure it meets all requirements from previous stages. When the user is satisfied, ask if they would like to generate the final Software Specification document." (line 34)

4. **Document Storage**
   - Each expert's document is saved in both the root directory (e.g., `PRD.md`) and the scripts directory (e.g., `scripts/prd.txt`)
   - The Product Manager's document is saved as `scripts/prd.txt` for Task Master compatibility
   - The UX Designer's document is saved as `scripts/ux_design.txt`
   - The Software Architect's document is saved as `scripts/software_spec.txt`
   - When all stages are complete, a comprehensive document combining all three experts' outputs is generated and saved as `comprehensive_specification.md` and `scripts/comprehensive_specification.txt`

### 1. Product Definition (AI Product Manager)

The Product Manager guides you through defining your product vision and requirements.

**Required Topics:**
- **Product Vision**: Overall concept and goals of the product
- **User Personas**: Detailed profiles of target users
- **Business Requirements**: Core requirements and constraints
- **Feature Map**: Key features with priorities
- **Success Criteria**: Metrics and KPIs for measuring success

**Output:** A comprehensive Product Requirements Document (PRD)

### 2. UX Design (AI UX Designer)

The UX Designer helps you create a user experience plan based on the PRD.

**Required Topics:**
- **UI Documentation**: Visual design and UI components
- **Feature Specifications**: Detailed feature descriptions
- **User Journeys**: User flows and paths
- **Interaction Patterns**: How users interact with features
- **Data Requirements**: Information architecture and data needs

**Output:** A detailed UX Design Document

### 3. Technical Architecture (AI Software Architect)

The Software Architect helps you define the technical implementation plan.

**Required Topics:**
- **Technical Architecture**: Overall system architecture
- **API Specifications**: API design and endpoints
- **Implementation Tasks**: Development tasks breakdown
- **Database Schema**: Data model and relationships
- **Testing Strategy**: Quality assurance approach

**Output:** A comprehensive Software Specification

The workflow automatically tracks which topics have been covered in each stage and guides you through a complete product development process. For more details, see [Enhanced Workflow Documentation](docs/enhanced-workflow.md).

## Standalone PRD Generation

The AI Expert Workflow is designed to work completely standalone:

```bash
# Install the AI Expert Workflow MCP
npm install -g ai-expert-workflow-mcp

# Set your OpenRouter API key
export OPENROUTER_API_KEY=your_openrouter_key_here

# Generate a PRD with the default model
npx ai-expert-workflow-generate "Your detailed project description"

# Or specify a different model for more creative or complex projects
MODEL=openai/gpt-4o npx ai-expert-workflow-generate "Your detailed project description"
```

This script:
1. Generates a comprehensive PRD document based on your description
2. Saves it as `prd.md` in your current directory
3. Also saves it in Task Master compatible format (at `scripts/prd.txt`) in case you want to use Task Master later

## Optional: Task Master Integration

> **Note:** Task Master integration is completely optional. You can use AI Expert Workflow on its own to generate PRDs.
>
> If you do want to use Task Master, you'll need these API keys:
> - **OpenRouter API key** for AI Expert Workflow (get one from [OpenRouter](https://openrouter.ai/keys))
> - **Anthropic API key** for Task Master AI (get one from [Anthropic](https://console.anthropic.com/))
> - **Perplexity API key** (optional) for Task Master AI enhanced research capabilities (get one from [Perplexity](https://docs.perplexity.ai/docs/getting-started))

### Using Task Master to Parse the PRD

If you want to convert your PRD into development tasks, you can use Task Master in one of two ways:

**Option 1: MCP Integration** (For Cursor users)
1. Add the Task Master MCP to your editor configuration:
   ```json
   "mcpServers": {
     "taskmaster-ai": {
       "command": "npx",
       "args": ["-y", "task-master-ai"],
       "env": {
         "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY_HERE",
         "MODEL": "claude-3-sonnet-20240229"
       }
     }
   }
   ```
2. Then ask your AI assistant:
   ```
   Can you parse the PRD at scripts/prd.txt and generate tasks?
   ```

**Option 2: Command Line Usage**
1. Install Task Master:
   ```
   npm install -g task-master-ai
   ```
2. Parse the PRD:
   ```
   task-master parse-prd scripts/prd.txt
   ```

### Utility Scripts

The project includes utility scripts to demonstrate Task Master integration:

- `src/generate-task-master-files.js`: Creates sample PRD and Task Master integration files using the MCP implementation
- `src/generate-task-master-files-simple.js`: Creates sample PRD and Task Master integration files without using MCP

These scripts are useful for testing and understanding how the integration works.

## For More Information

See the [docs/Create-MCP.md](docs/Create-MCP.md) file for a complete guide on creating your own AI Expert Workflow MCP server from scratch.

For details on OpenRouter API integration, see [docs/OPENROUTER.md](docs/OPENROUTER.md).

For Task Master AI documentation, see [Task Master on npm](https://www.npmjs.com/package/task-master-ai).

## License

MIT