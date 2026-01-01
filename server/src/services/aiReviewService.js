const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate AI code review using Groq
 */
const generateAIReview = async (code, language, title, description) => {
  try {
    const prompt = `You are an expert code reviewer. Review the following ${language} code and provide constructive feedback.

Title: ${title}
Description: ${description}

Code:
\`\`\`${language}
${code}
\`\`\`

Please provide a detailed code review including:
1. Overall code quality assessment
2. Potential bugs or issues
3. Security concerns (if any)
4. Performance improvements
5. Best practices and suggestions
6. A rating from 1-5 stars (1=poor, 5=excellent)

Format your response as JSON with this structure:
{
  "rating": <number 1-5>,
  "summary": "<brief overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "issues": ["<issue 1>", "<issue 2>", ...],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", ...],
  "security": "<security assessment or 'No major security concerns'>",
  "performance": "<performance assessment>"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert code reviewer. Always respond with valid JSON only, no markdown formatting or code blocks."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile", // Fast and free model
      temperature: 0.7,
      max_tokens: 2000,
    });

    const reviewText = completion.choices[0]?.message?.content || '';
    
    // Try to parse JSON response
    let reviewData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = reviewText.replace(/```json\n?|\n?```/g, '').trim();
      reviewData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', reviewText);
      // Fallback to raw text if JSON parsing fails
      reviewData = {
        rating: 3,
        summary: reviewText,
        strengths: [],
        issues: [],
        suggestions: [],
        security: "Could not assess",
        performance: "Could not assess"
      };
    }

    return {
      rating: reviewData.rating || 3,
      comment: formatReviewComment(reviewData),
      rawData: reviewData
    };

  } catch (error) {
    console.error('Error generating AI review:', error);
    throw new Error('Failed to generate AI review: ' + error.message);
  }
};

/**
 * Format the review data into a readable comment
 */
const formatReviewComment = (reviewData) => {
  let comment = `## AI Code Review\n\n`;
  
  comment += `**Overall Assessment:** ${reviewData.summary}\n\n`;
  
  if (reviewData.strengths && reviewData.strengths.length > 0) {
    comment += `### ✅ Strengths:\n`;
    reviewData.strengths.forEach(strength => {
      comment += `- ${strength}\n`;
    });
    comment += `\n`;
  }
  
  if (reviewData.issues && reviewData.issues.length > 0) {
    comment += `### ⚠️ Issues Found:\n`;
    reviewData.issues.forEach(issue => {
      comment += `- ${issue}\n`;
    });
    comment += `\n`;
  }
  
  if (reviewData.suggestions && reviewData.suggestions.length > 0) {
    comment += `### 💡 Suggestions:\n`;
    reviewData.suggestions.forEach(suggestion => {
      comment += `- ${suggestion}\n`;
    });
    comment += `\n`;
  }
  
  if (reviewData.security) {
    comment += `### 🔒 Security:\n${reviewData.security}\n\n`;
  }
  
  if (reviewData.performance) {
    comment += `### ⚡ Performance:\n${reviewData.performance}\n`;
  }
  
  return comment;
};

module.exports = {
  generateAIReview
};