# TechLibs Agent Workflow - Mermaid Diagrams

## 1. Overall Workflow Architecture

```mermaid
graph TD
    A[Input: Problem Statement + Context] --> B[AI Research & Discovery]
    B --> C[User Research]
    C --> D[Design System Brief]
    D --> E{Design Approval Gate}
    E -->|Approved| F[Tech Architecture]
    E -->|Rejected| D
    F --> G{Architecture Approval Gate}
    G -->|Approved| H[Stories & Epics]
    G -->|Rejected| F
    H --> I[Tasks & Implementation]
    I --> J[Definition of Done]
    J --> K[Roadmap Plan]
    K --> L[Assemble PRD]
    L --> M[Final PRD Output]

    style A fill:#e1f5fe
    style M fill:#c8e6c9
    style E fill:#fff3e0
    style G fill:#fff3e0
```

## 2. Enhanced Input Schema Structure

```mermaid
graph LR
    Input[User Input] --> PS[problemStatement*]
    Input --> CC[companyContext]
    Input --> CON[constraints]
    Input --> ASS[assets]
    Input --> TA[targetAudience]
    Input --> SC[successCriteria]
    Input --> PR[priority]

    PS --> |Required| Validation{Input Validation}
    CC --> |Optional Text| Validation
    CON --> |Optional Text| Validation
    ASS --> |Optional Text| Validation
    TA --> |Optional Text| Validation
    SC --> |Optional Text| Validation
    PR --> |low/medium/high/critical| Validation

    Validation --> Context[Shared Context Manager]

    style PS fill:#ffcdd2
    style Validation fill:#e8f5e8
    style Context fill:#e3f2fd
```

## 3. Shared Context Management System

```mermaid
graph TB
    subgraph "Shared Context Manager"
        Init[Initialize Context] --> Store[(Context Storage)]
        Store --> Update[Update Context]
        Update --> Validate[Quality Validation]
        Validate --> Retrieve[Retrieve Context]
    end

    subgraph "Context Data Structure"
        Core[Core Project Info]
        Insights[Extracted Insights]
        Decisions[Key Decisions]
        References[Cross-References]
        Quality[Quality Metrics]
        Steps[Step-Specific Data]
    end

    subgraph "Quality Validation"
        Spec[Specificity Check]
        Rel[Relevance Check]
        Comp[Completeness Check]
        Act[Actionability Check]
    end

    Store --> Core
    Store --> Insights
    Store --> Decisions
    Store --> References
    Store --> Quality
    Store --> Steps

    Validate --> Spec
    Validate --> Rel
    Validate --> Comp
    Validate --> Act

    style Store fill:#fff9c4
    style Validate fill:#f3e5f5
```

## 4. Agent Architecture Deep Dive

```mermaid
graph TD
    subgraph "Product Owner Agent"
        PO_Model[GPT-4o-mini]
        PO_Memory[Memory with LibSQL]
        PO_Tools[Memory Tool]
        PO_Prompt[Specialized Prompt]
        PO_MaxSteps[maxSteps: 3]
    end

    subgraph "BDD Specialist Agent"
        BDD_Model[GPT-4o-mini]
        BDD_Memory[Memory with LibSQL]
        BDD_Tools[Memory Tool]
        BDD_Prompt[BDD Specialized Prompt]
        BDD_MaxSteps[maxSteps: 2]
    end

    subgraph "Memory System"
        LibSQL[(LibSQL Database)]
        Memory_Context[Context Retention]
        Memory_History[Conversation History]
    end

    PO_Memory --> LibSQL
    BDD_Memory --> LibSQL
    LibSQL --> Memory_Context
    LibSQL --> Memory_History

    style PO_Model fill:#e8f5e8
    style BDD_Model fill:#e8f5e8
    style LibSQL fill:#fff3e0
```

## 5. AI Research & Discovery Step Detail

```mermaid
sequenceDiagram
    participant Input as Input Data
    participant Context as Shared Context
    participant Agent as Product Owner Agent
    participant Validation as Quality Validator
    participant Output as Step Output

    Input->>Context: Initialize project context
    Context->>Context: Generate project ID
    Context->>Agent: Enhanced prompt with context
    
    loop Retry Logic (max 2 attempts)
        Agent->>Agent: Generate research analysis
        Agent->>Validation: Validate output quality
        alt Quality Score >= 70%
            Validation-->>Context: Update context with results
            Context-->>Output: Return enhanced output
        else Quality Score < 70%
            Validation-->>Agent: Retry with feedback
        end
    end

    Note over Context: Stores: decisions, requirements, references
    Note over Output: Includes: researchBrief, keyFindings, _projectId
```

## 6. User Research Step Detail

```mermaid
sequenceDiagram
    participant Input as Previous Step Output
    participant Context as Shared Context
    participant Agent as Product Owner Agent
    participant Validation as Quality Validator
    participant Output as Step Output

    Input->>Context: Retrieve/Initialize context
    Context->>Context: Get relevant previous insights
    Context->>Agent: Enhanced prompt with context + history
    
    loop Retry Logic (max 2 attempts)
        Agent->>Agent: Generate personas, journeys, use cases
        Agent->>Validation: Validate specificity and relevance
        alt Quality Validation Passes
            Validation-->>Context: Update with user research data
            Context-->>Output: Return comprehensive output
        else Validation Fails
            Validation-->>Agent: Provide feedback for improvement
        end
    end

    Note over Context: References: ai-research-and-discovery
    Note over Output: Includes: personas, journeys, useCases, _projectId
```

## 7. Stories & Epics Step (Enhanced)

```mermaid
graph TD
    Input[Use Cases from User Research] --> Validation[Input Validation]
    Validation --> Context[Get Shared Context]
    Context --> Prompt[Enhanced BDD Prompt]
    
    Prompt --> Agent[BDD Specialist Agent]
    Agent --> Schema[Structured Output Schema]
    Schema --> JSON[JSON Extraction]
    
    JSON --> QualityCheck{Quality Validation}
    QualityCheck -->|Pass| Metadata[Add Metadata]
    QualityCheck -->|Fail| Retry[Retry with Feedback]
    Retry --> Agent
    
    Metadata --> Stories[Stories & Epics Array]
    Stories --> Output[Enhanced Output + Context]

    subgraph "Quality Checks"
        Format[Story Format Check]
        Length[Minimum Length Check]
        Count[Minimum Count Check]
        BDD[BDD Format Validation]
    end

    QualityCheck --> Format
    QualityCheck --> Length
    QualityCheck --> Count
    QualityCheck --> BDD

    style Agent fill:#e8f5e8
    style QualityCheck fill:#fff3e0
```

## 8. Observability & Monitoring Flow

```mermaid
graph LR
    subgraph "Workflow Execution"
        Step1[AI Research] --> Step2[User Research]
        Step2 --> Step3[Design Brief]
        Step3 --> StepN[... Other Steps]
    end

    subgraph "Observability Layer"
        Metrics[Performance Metrics]
        Validation[Quality Validation]
        Context[Context Tracking]
        Logs[Enhanced Logging]
    end

    subgraph "Monitoring Data"
        Duration[Step Duration]
        Quality[Quality Scores]
        Errors[Error Tracking]
        Context_Data[Context Evolution]
    end

    Step1 --> Metrics
    Step2 --> Metrics
    Step3 --> Metrics
    StepN --> Metrics

    Metrics --> Duration
    Validation --> Quality
    Context --> Context_Data
    Logs --> Errors

    style Metrics fill:#e3f2fd
    style Quality fill:#f3e5f5
```

## 9. Error Handling & Retry Logic

```mermaid
flowchart TD
    Start[Step Execution Start] --> Execute[Execute Agent]
    Execute --> Success{Execution Success?}
    
    Success -->|Yes| Validate[Quality Validation]
    Success -->|No| Error[Capture Error]
    
    Validate --> QualityPass{Quality Score >= 70%?}
    QualityPass -->|Yes| UpdateContext[Update Shared Context]
    QualityPass -->|No| QualityError[Quality Validation Failed]
    
    Error --> RetryCheck{Retry Attempt < Max?}
    QualityError --> RetryCheck
    
    RetryCheck -->|Yes| Delay[Exponential Backoff]
    RetryCheck -->|No| FinalError[Throw Final Error]
    
    Delay --> Execute
    UpdateContext --> Output[Return Success Output]
    
    style Execute fill:#e8f5e8
    style Validate fill:#fff3e0
    style FinalError fill:#ffcdd2
    style Output fill:#c8e6c9
```

## 10. Complete Data Flow

```mermaid
graph TB
    subgraph "Input Layer"
        UI[Playground UI] --> Schema[Enhanced Input Schema]
        Schema --> Validation[Input Validation]
    end

    subgraph "Context Management"
        SharedContext[Shared Context Manager]
        ProjectID[Project ID Generator]
        QualityValidator[Quality Validator]
    end

    subgraph "Agent Layer"
        PO[Product Owner Agent]
        BDD[BDD Specialist Agent]
        Memory[(Memory System)]
    end

    subgraph "Workflow Steps"
        Research[AI Research & Discovery]
        Users[User Research]
        Design[Design System Brief]
        Tech[Tech Architecture]
        Stories[Stories & Epics]
        Tasks[Tasks & Implementation]
        DOD[Definition of Done]
        Roadmap[Roadmap Plan]
        Assembly[Assemble PRD]
    end

    subgraph "Output Layer"
        PRD[Final PRD]
        Metrics[Performance Metrics]
        Context_Summary[Context Summary]
    end

    Validation --> SharedContext
    SharedContext --> ProjectID
    
    Research --> PO
    Users --> PO
    Stories --> BDD
    
    PO --> Memory
    BDD --> Memory
    
    SharedContext --> QualityValidator
    QualityValidator --> Research
    QualityValidator --> Users
    QualityValidator --> Stories
    
    Research --> Users
    Users --> Design
    Design --> Tech
    Tech --> Stories
    Stories --> Tasks
    Tasks --> DOD
    DOD --> Roadmap
    Roadmap --> Assembly
    
    Assembly --> PRD
    Assembly --> Metrics
    Assembly --> Context_Summary

    style SharedContext fill:#e3f2fd
    style QualityValidator fill:#f3e5f5
    style PRD fill:#c8e6c9
```

## 11. Key Improvements Summary

```mermaid
mindmap
    root((TechLibs Agent Improvements))
        Enhanced UX
            Text-based inputs
            Optional fields
            Better descriptions
            Intuitive interface
        
        Context Management
            Shared context system
            Cross-step continuity
            Decision tracking
            Requirement extraction
        
        Quality Validation
            Specificity checks
            Relevance scoring
            Completeness validation
            Actionability assessment
        
        Agent Enhancements
            Memory integration
            Structured output
            Better prompts
            Retry logic
        
        Observability
            Performance tracking
            Quality scoring
            Error monitoring
            Context evolution
```

This comprehensive set of Mermaid diagrams covers every aspect of the TechLibs Agent workflow system, from the high-level architecture down to detailed step execution flows, error handling, and quality validation processes.