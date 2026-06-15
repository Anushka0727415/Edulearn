# app.py - EduTutorAI Backend
# SDG 4: Quality Education - AI Doubt Solver for Students

import os
import openai
from flask import Flask, render_template, request, jsonify

# Initialize Flask app
app = Flask(__name__)

# ==============================================
# OPTION 1: Using OpenAI API (Recommended)
# Get your API key from: https://platform.openai.com/api-keys
# ==============================================
# Set your OpenAI API key here or as environment variable
# For production, use: openai.api_key = os.getenv("OPENAI_API_KEY")
openai.api_key = "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"  # Replace with your actual key

# ==============================================
# OPTION 2: Using Free Hugging Face API (No credit card required)
# Uncomment this section if you don't have OpenAI key
# ==============================================
# import requests
# HF_API_KEY = "YOUR_HUGGINGFACE_API_KEY"  # Get free from huggingface.co
# HF_MODEL = "microsoft/DialoGPT-medium"
# 
# def get_huggingface_response(prompt):
#     headers = {"Authorization": f"Bearer {HF_API_KEY}"}
#     payload = {
#         "inputs": prompt,
#         "parameters": {"max_length": 300, "temperature": 0.7}
#     }
#     response = requests.post(
#         f"https://api-inference.huggingface.co/models/{HF_MODEL}",
#         headers=headers,
#         json=payload
#     )
#     if response.status_code == 200:
#         return response.json()[0]['generated_text']
#     return "Sorry, I'm having trouble right now. Please try again."

def get_ai_response(question, grade_level):
    """
    Get AI response using OpenAI GPT API
    grade_level: 5 to 10 (student's class)
    """
    system_prompt = f"""You are EduTutorAI, a friendly and patient tutor for students in Class {grade_level}.
    
    Rules:
    1. Explain concepts in simple, age-appropriate language for Class {grade_level}.
    2. Use examples that students can relate to (cricket, movies, food, games).
    3. Break down problems step-by-step.
    4. NEVER give just the final answer - explain the reasoning.
    5. Keep answers under 150 words unless necessary.
    6. If the question is unclear, ask for clarification.
    7. Be encouraging and positive.
    
    Remember: The student is in Class {grade_level}, not a college student.
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"⚠️ Error: {str(e)}\n\nPlease check your OpenAI API key or try again later."

def generate_quiz(topic, grade_level):
    """
    Generate a 5-question quiz on a given topic
    """
    prompt = f"""Generate a short 5-question quiz for Class {grade_level} students on the topic: {topic}.
    
    Format each question as:
    Q1: [question]
    A) [option]
    B) [option]
    C) [option]
    D) [option]
    Answer: [letter]
    
    Make questions fun and educational. Include a mix of easy and medium difficulty.
    """
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful quiz generator for school students."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=800
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Could not generate quiz: {str(e)}"

# Routes
@app.route('/')
def home():
    """Render the main chat interface"""
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    """Handle user question and return AI response"""
    data = request.json
    question = data.get('question', '')
    grade_level = data.get('grade_level', 8)
    
    if not question:
        return jsonify({'error': 'Please enter a question'}), 400
    
    # Get AI response
    answer = get_ai_response(question, grade_level)
    
    return jsonify({
        'question': question,
        'answer': answer,
        'grade_level': grade_level
    })

@app.route('/quiz', methods=['POST'])
def quiz():
    """Generate a practice quiz"""
    data = request.json
    topic = data.get('topic', 'Mathematics')
    grade_level = data.get('grade_level', 8)
    
    if not topic:
        return jsonify({'error': 'Please enter a topic'}), 400
    
    quiz_content = generate_quiz(topic, grade_level)
    
    return jsonify({
        'topic': topic,
        'quiz': quiz_content,
        'grade_level': grade_level
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'running', 'message': 'EduTutorAI is active!'})

if __name__ == '__main__':
    # Run the app
    # Set debug=False for production
    app.run(debug=True, host='0.0.0.0', port=5000)