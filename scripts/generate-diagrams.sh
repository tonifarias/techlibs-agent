#!/bin/bash

# Script to generate Mermaid diagrams as images
echo "🎨 Generating Mermaid diagrams..."

# Create diagrams directory if it doesn't exist
mkdir -p diagrams

# Generate PNG images from Mermaid diagrams
npx mmdc -i WORKFLOW_DIAGRAMS.md -o diagrams/workflow-diagrams.png -t dark -b transparent

echo "✅ Diagrams generated in ./diagrams/ folder"
echo "🌐 You can also view online at: https://mermaid.live/"